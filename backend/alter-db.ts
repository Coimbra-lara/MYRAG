import { prisma } from './src/prisma';
async function run() {
  try {
    // Drop the column and recreate it as vector without dimension limit
    await prisma.$executeRawUnsafe(`ALTER TABLE "DocumentChunk" ALTER COLUMN embedding TYPE vector`);
    console.log('ALTER OK');
  } catch(e) {
    console.error('ERR', e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
