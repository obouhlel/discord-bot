import { InferenceClient } from "@huggingface/inference";

export default class LLMService {
  private client: InferenceClient;

  constructor() {
    this.client = new InferenceClient(process.env.LLM_TOKEN!);
  }

  private async _generateMessage(
    message: string,
    prompt: string,
    temperature: number,
    max_tokens: number
  ): Promise<string> {
    try {
      const chatCompletion = await this.client.chatCompletion({
        provider: "novita",
        model: "deepseek-ai/DeepSeek-V3-0324",
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

  public async generateMessage(message: string): Promise<string> {
    const prompt =
      "You are a bot discord, you can speek in french and english, you interact with member in the channel";
    return await this._generateMessage(message, prompt, 2, 512);
  }

  public async generateDMMessage(message: string): Promise<string> {
    const prompt =
      "You will help peaple in mathematic and the programming, you explain the problem before to send code, you send code only if the user tell you to send it.";

    return await this._generateMessage(message, prompt, 1, 1024);
  }
}
