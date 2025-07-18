import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401); // No token

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    (req as any).user = user;
    next();
  });
};

