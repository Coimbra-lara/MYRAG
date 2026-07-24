import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-2",
});

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest", // Excelente e gratuito na cota do Google AI Studio
  temperature: 0.3, // Temperatura baixa para respostas mais factuais
});

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { documentId, message, chatId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Não autenticado.' });
      return;
    }

    if (!documentId || !message) {
      res.status(400).json({ error: 'ID do documento e mensagem são obrigatórios.' });
      return;
    }

    // 1. Verifica se o documento pertence ao usuário
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      res.status(404).json({ error: 'Documento não encontrado.' });
      return;
    }

    // 2. Gerencia a Sessão de Chat
    let currentChatId = chatId;
    if (!currentChatId) {
      const newChat = await prisma.chat.create({
        data: {
          userId,
          title: message.substring(0, 30) + '...', // Título baseado na primeira mensagem
        },
      });
      currentChatId = newChat.id;
    }

    // Salva a mensagem do usuário no banco
    await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: 'user',
        content: message,
      },
    });

    // 3. RAG - Recuperação de Contexto (Busca Vetorial)
    const questionVectorResponse = await embeddings.embedQuery(message);
    const questionVector = questionVectorResponse.slice(0, 1536);
    
    // Consulta SQL bruta usando pgvector. 
    // O operador <-> calcula a distância L2 (Euclidiana) entre os vetores.
    // Buscamos os 5 chunks mais relevantes do documento específico.
    // Converte o array para string para o pgvector e busca no banco
    const vectorString = JSON.stringify(questionVector);
    const similarChunks = await prisma.$queryRaw<Array<{ id: string; content: string }>>`
      SELECT id, content
      FROM "DocumentChunk"
      WHERE "documentId" = ${documentId}
      ORDER BY embedding <-> ${vectorString}::vector
      LIMIT 5
    `;

    const contextText = similarChunks.map((chunk) => chunk.content).join('\n\n');

    // 4. Geração com LLM (Passando o Contexto)
    const promptTemplate = PromptTemplate.fromTemplate(`
      Você é um assistente prestativo especializado em responder perguntas baseadas estritamente no documento fornecido.
      Se a resposta não estiver no documento, diga que não tem informações suficientes.

      Contexto do documento:
      {context}

      Pergunta do Usuário:
      {question}

      Resposta:
    `);

    const formattedPrompt = await promptTemplate.format({
      context: contextText,
      question: message,
    });

    const response = await llm.invoke(formattedPrompt);
    const aiMessageContent = response.content as string;

    // 5. Salvar resposta da IA
    const aiMessage = await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: 'assistant',
        content: aiMessageContent,
      },
    });

    res.json({
      chatId: currentChatId,
      answer: aiMessageContent,
      messageId: aiMessage.id
    });

  } catch (error) {
    console.error('Erro no Chat RAG:', error);
    res.status(500).json({ error: 'Erro interno ao processar a mensagem.' });
  }
};

export const listChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) return;

    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar conversas.' });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;
    
    if (!userId) return;

    // Verifica se o chat pertence ao user
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat não encontrado.' });
      return;
    }

    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
};
