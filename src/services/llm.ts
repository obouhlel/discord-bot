import { InferenceClient } from "@huggingface/inference";

export default class LLMService {
  private _client: InferenceClient;
  private _prompt: string;

  constructor() {
    this._client = new InferenceClient(Bun.env.LLM_TOKEN);
    this._prompt = "";
  }

  private async _getPromptDiscord() {
    const file = Bun.file("./data/prompt/discord.txt");
    this._prompt = await file.text();
  }

  private async _generateMessage(
    message: string,
    prompt: string,
    temperature: number,
    max_tokens: number,
  ): Promise<string> {
    try {
      const chatCompletion = await this._client.chatCompletion({
        provider: "auto",
        model: "Qwen/Qwen2.5-Coder-32B-Instruct",
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: temperature,
        top_p: 0.5,
        max_tokens: max_tokens,
        stream: false,
      });

      const response = chatCompletion.choices[0]?.message.content;

      if (!response) {
        throw new Error("Response empty");
      }

      return response;
    } catch (error) {
      console.error("Error :", error);
      return "I can't send message";
    }
  }

  public async generateMessageSlash(message: string): Promise<string> {
    await this._getPromptDiscord();
    const prompt = this._prompt + "You are execute with slash command.";
    return await this._generateMessage(message, prompt, 1, 512);
  }

  public async generateMessage(message: string): Promise<string> {
    await this._getPromptDiscord();
    const prompt =
      this._prompt + "You were mentioned by a user in a Discord server.";
    return await this._generateMessage(message, prompt, 2, 512);
  }

  public async generateDMMessage(message: string): Promise<string> {
    await this._getPromptDiscord();
    const prompt = this._prompt + "You are in direct message with a user.";
    return await this._generateMessage(message, prompt, 1, 1024);
  }
}
