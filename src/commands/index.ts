import { ping } from "./ping";
import { echo } from "./echo";

export const commandsInfo = [ping.data.toJSON(), echo.data.toJSON()];
export const commands = [ping, echo];
