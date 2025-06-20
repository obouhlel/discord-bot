import type { RedisClient } from "bun";
import type { TextChannel } from "discord.js";
import { EmbedBuilder } from "discord.js";
import type {
	QuizCharacters,
	QuizData,
	QuizHint,
	QuizHintType,
} from "types/quiz";
import { capitalize } from "utils/capitalize";

export class QuizHintManager {
	private _data: QuizData;
	private _channel: TextChannel;
	private _redis: RedisClient;

	private readonly _hintParams = new Map([
		["cover", "The cover of the anime/manga (-4)"],
		["synopsis", "The plot summary of the anime/manga (-4)"],
		["genres", "The genres of the anime/manga (-1)"],
		["characters", "An other character of anime/manga (-1)"],
	]);

	private readonly _hintNumberParams = new Map([
		[1, "cover" as keyof QuizHint],
		[2, "synopsis" as keyof QuizHint],
		[3, "genres" as keyof QuizHint],
		[4, "characters" as keyof QuizHint],
	]);

	private readonly _hintScore = new Map([
		["cover" as keyof QuizHint, 4],
		["synopsis" as keyof QuizHint, 4],
		["genres" as keyof QuizHint, 1],
		["characters" as keyof QuizHint, 1],
	]);

	private readonly _hintMapHandler = {
		cover: (key: string, value: string) => this._displayCover(key, value),
		synopsis: (key: string, value: string) => this._handlerSynopsis(key, value),
		genres: (key: string, value: string[]) => this._displayGenres(key, value),
		characters: (key: string, value: QuizCharacters[]) =>
			this._handlerCharacter(key, value as QuizCharacters[]),
	};

	constructor(data: QuizData, channel: TextChannel, redis: RedisClient) {
		this._data = data;
		this._channel = channel;
		this._redis = redis;
	}

	private _getHintValue(hint: keyof QuizHint): QuizHintType {
		return this._data.hint[hint];
	}

	private _getHintValueById(
		index: number,
	): [keyof QuizHint, QuizHintType] | null {
		const hint = this._hintNumberParams.get(index);
		if (!hint) return null;
		return [hint, this._data.hint[hint]];
	}

	private _canUseHint(param: keyof QuizHint): boolean {
		const value = this._hintScore.get(param);
		if (!value) return false;
		const score = this._data.score - value;
		if (score < 1) {
			return false;
		}
		this._data.score -= value;
		return true;
	}

	private async _displayCover(key: string, value: string) {
		const embed = new EmbedBuilder()
			.setTitle(capitalize(key))
			.setImage(value)
			.setColor("Random");
		await this._channel.send({ embeds: [embed] });
	}

	private async _displayGenres(key: string, value: string[]) {
		await this._channel.send(
			`**${capitalize(key)}:**\n${value.map((genre) => `- ${genre}\n`).join("")}`,
		);
	}

	private async _handlerCharacter(key: string, value: QuizCharacters[]) {
		if (value.length === 0) {
			await this._channel.send(`All ${key} have been sent`);
			return;
		}
		const random = Math.floor(Math.random() * (value.length - 1));
		const character = value[random];
		if (!character) return;
		const embed = new EmbedBuilder()
			.setColor("Random")
			.setTitle(character.name)
			.setImage(character.image);
		this._data.hint.characters = this._data.hint.characters.filter(
			(c) => character.id != c.id,
		);
		await this._channel.send({ embeds: [embed] });
	}

	private async _handlerSynopsis(key: string, value: string) {
		await this._channel.send(
			`# ${capitalize(key.toString())}\n>>> ${value.toString()}`,
		);
	}

	private async _hintHandler(key: keyof QuizHint, value: QuizHintType) {
		if (key === "characters") {
			await this._hintMapHandler[key](key, value as QuizCharacters[]);
		} else if (key === "genres") {
			await this._hintMapHandler[key](key, value as string[]);
		} else {
			await this._hintMapHandler[key](key, value as string);
		}
	}

	private _getHintInfo(): EmbedBuilder {
		const paramsList = Array.from(this._hintParams.entries())
			.map(([key, desc], i) => `${(i + 1).toString()} - \`${key}\`: ${desc}`)
			.join("\n");
		const embed = new EmbedBuilder()
			.setTitle("Available Hint Parameters")
			.setColor("Gold")
			.setDescription(
				`Use !hint with one or more of these parameters:\n${paramsList}\n**Example:** \`!hint synopsis\` or \`!hint 1\``,
			);
		return embed;
	}

	private async _updateData(key: string) {
		await this._redis.set(key, JSON.stringify(this._data));
	}

	public async hint(answer: string, quizId: string) {
		const [, param] = answer.split(" ");
		if (
			param &&
			param in this._data.hint &&
			this._canUseHint(param as keyof QuizHint)
		) {
			const hint = this._getHintValue(param as keyof QuizHint);
			if (!hint) {
				await this._channel.send(`The \`${param}\` not found in database`);
				return;
			}
			await this._hintHandler(param as keyof QuizHint, hint);
			await this._updateData(quizId);
		} else if (param && this._hintNumberParams.get(Number(param))) {
			const test = this._hintNumberParams.get(Number(param));
			const result = this._getHintValueById(Number(param));
			if ((test && !this._canUseHint(test)) || !result) {
				await this._channel.send("You can't use more hint, use `!skip`.");
				return;
			}
			const [key, value] = result;
			await this._hintHandler(key, value);
			await this._updateData(quizId);
		} else {
			if (param) {
				await this._channel.send("You can't use more hint, use `!skip`.");
			} else {
				await this._channel.send({
					embeds: [this._getHintInfo()],
				});
			}
		}
	}
}
