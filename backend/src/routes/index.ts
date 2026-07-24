import { Router } from 'express';
import authRoutes from './auth';
import documentRoutes from './documents';
import chatRoutes from './chats';

const router = Router();

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/chats', chatRoutes);

export default router;
