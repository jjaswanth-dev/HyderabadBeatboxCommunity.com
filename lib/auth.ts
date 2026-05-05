import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export async function protect(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { username: string };
      
      if (decoded.username !== process.env.ADMIN_USERNAME) {
        throw new Error('Not authorized');
      }
      
      return decoded.username;
    } catch (error) {
      throw new Error('Not authorized, token failed');
    }
  }

  throw new Error('Not authorized, no token');
}
