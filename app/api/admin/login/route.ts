import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  await connectToDatabase();
  
  const { username, password } = await req.json();

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign(
    { username: process.env.ADMIN_USERNAME },
    process.env.JWT_SECRET as string,
    { expiresIn: '30d' }
  );

  return NextResponse.json({
    username: process.env.ADMIN_USERNAME,
    token
  });
}
