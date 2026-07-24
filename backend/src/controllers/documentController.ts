import { Response } from 'express';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';

// Inicializa o gerador de embeddings do Google Gemini
// Requer que GOOGLE_API_KEY esteja no .env
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-2", // Modelo de embeddings do Gemini
});

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      return;
    }

    // 1. Extrair texto do PDF
    // Resolve problema de compatibilidade TypeScript/CommonJS no pdf-parse
    const parse = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default;
    const pdfData = await parse(req.file.buffer);
    const textContent = pdfData.text;

    // 2. Criar o documento no banco de dados (sem as chunks ainda)
    const document = await prisma.document.create({
      data: {
        filename: req.file.originalname,
        content: textContent,
        userId: userId,
      },
    });

    // 3. Quebrar o texto longo em pedaços menores (Chunks) para a IA processar melhor
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200, // Sobreposição para não perder contexto entre os chunks
    });

    const chunks = await textSplitter.splitText(textContent);

    // 4. Gerar Embeddings e salvar no banco
    // Usamos um loop sequencial simples para legibilidade, embora pudesse ser paralelizado (cuidado com Rate Limits da OpenAI)
    for (const chunkText of chunks) {
      // Gera o vetor numérico do texto e corta para 1536 dimensões (suportado por modelos Matryoshka como o Gemini) para caber no banco de dados atual
      const vectorResponse = await embeddings.embedQuery(chunkText);
      const vector = vectorResponse.slice(0, 1536);
      const chunkId = uuidv4();

      // Converte o array numérico para uma string no formato suportado pelo pgvector: '[0.1, 0.2, ...]'
      const vectorString = JSON.stringify(vector);

      // Como o Prisma não suporta inserção nativa simples de tipos 'vector' customizados no momento,
      // utilizamos $executeRaw para rodar o SQL bruto do pgvector.
      await prisma.$executeRaw`
        INSERT INTO "DocumentChunk" (id, "documentId", content, embedding)
        VALUES (${chunkId}, ${document.id}, ${chunkText}, ${vectorString}::vector)
      `;
    }

    res.status(201).json({
      message: 'Documento processado com sucesso!',
      documentId: document.id,
      chunksCount: chunks.length,
    });
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    res.status(500).json({ error: 'Erro interno ao processar o documento.' });
  }
};

export const listDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const documents = await prisma.document.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar documentos.' });
  }
};
