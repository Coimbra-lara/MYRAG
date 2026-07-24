import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendendo o tipo Request do Express para incluir o user
export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const parts = authHeader.split(' ');
  const token = parts[1];

  if (!token) {
    res.status(401).json({ error: 'Token malformado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
