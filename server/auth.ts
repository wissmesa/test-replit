import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isAuthenticated(req: any, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
}

export function isAdmin(req: any, res: Response, next: NextFunction) {
  if (req.session && req.session.userId && req.session.userType === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
}