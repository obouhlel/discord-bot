import { InferenceClient } from "@huggingface/inference";

export default class LLMService {
  private client: InferenceClient;

  constructor() {
    this.client = new InferenceClient(process.env.LLM_TOKEN!);
  }

  async generateMessage(message: string): Promise<string> {
    try {
      const chatCompletion = await this.client.chatCompletion({
        provider: "novita",
        model: "deepseek-ai/DeepSeek-V3-0324",
        messages: [
          {
            role: "system",
            content:
              "Tu es un bot discord, tu peux intéragir avec des utilisateurs de manière random, en pleine discution.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 2,
        top_p: 0,
        max_tokens: 512,
        stream: false,
      });

      const response = chatCompletion.choices[0]?.message.content;

      if (!response) {
        throw new Error("Response empty");
      }

      return response;
    } catch (error) {
      console.error("Error :", error);
      return "Je ne peux plus envoyer de message";
    }
  }
}
