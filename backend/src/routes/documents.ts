import { Router } from 'express';
import { uploadDocument, listDocuments } from '../controllers/documentController';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Todas as rotas de documentos requerem autenticação
router.use(authenticate);

// Rota para listar os documentos do usuário
router.get('/', listDocuments);

// Rota para upload de um PDF. 'file' é o nome do campo no formulário
router.post('/upload', upload.single('file'), uploadDocument);

export default router;
