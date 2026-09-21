import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const globalStore = global as any;
if (!globalStore.sessions) globalStore.sessions = {};
if (!globalStore.users) globalStore.users = {};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    let validSession = false;
    let userId = null;
    let phone = null;

    try {
      const client = await clientPromise;
      const db = client.db();
      
      const session = await db.collection('sessions').findOne({ token });
      if (session && session.expiresAt > new Date()) {
        validSession = true;
        userId = session.userId;
        phone = session.phone;
      }
    } catch (err) {
      const session = globalStore.sessions[token];
      if (session && session.expiresAt > new Date()) {
        validSession = true;
        userId = session.userId;
        phone = session.phone;
      }
    }

    if (!validSession) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { id: userId, phone } });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
