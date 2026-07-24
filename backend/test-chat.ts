import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-flash-latest",
      temperature: 0.3,
    });
    console.log('Invoking...');
    const res = await llm.invoke("Hello, how are you?");
    console.log('Res:', res.content);
  } catch (e) {
    console.error('ERROR:', e);
  }
}
main();
