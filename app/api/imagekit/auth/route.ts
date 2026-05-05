import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
  try {
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    });
    
    return Response.json({ 
      token, 
      expire, 
      signature, 
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY 
    });
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
