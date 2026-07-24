import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { sendMessage, listChats, getChatMessages } from '../controllers/chatController';

const router = Router();

router.use(authenticate);

router.post('/message', sendMessage);
router.get('/', listChats);
router.get('/:chatId/messages', getChatMessages);

export default router;
