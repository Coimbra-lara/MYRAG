import { prisma } from './src/prisma';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    console.log('Testing OpenAI...');
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
    });
    const vector = await embeddings.embedQuery("Teste de embedding");
    console.log('OpenAI OK! Vector length:', vector.length);

    console.log('Testing Prisma vector insert...');
    const vectorString = JSON.stringify(vector);
    
    // We can't insert into DocumentChunk without a Document. 
    // Let's just run a raw query to check if pgvector is enabled.
    const result = await prisma.$queryRawUnsafe(`SELECT '${vectorString}'::vector AS v`);
    console.log('Prisma pgvector OK!', result ? 'Success' : 'Fail');
  } catch (e) {
    console.error('ERROR OCCURRED:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
