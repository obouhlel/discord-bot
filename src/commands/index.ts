import type { Commands } from "../types/command.type";
import { ping } from "./ping";

export const commandsInfo = [ping.data.toJSON()];
export const commands: Commands[] = [ping];
