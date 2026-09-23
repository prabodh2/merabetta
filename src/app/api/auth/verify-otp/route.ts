import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';

const globalStore = global as any;
if (!globalStore.otpSessions) globalStore.otpSessions = {};
if (!globalStore.users) globalStore.users = {};
if (!globalStore.sessions) globalStore.sessions = {};

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, name } = await request.json();

    if (!phone || !/^\d{10}$/.test(phone) || !otp) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    let valid = false;
    let dbError = false;

    try {
      const client = await clientPromise;
      const db = client.db();
      
      const session = await db.collection('otp_sessions').findOne({ phone, otp });
      if (session && session.expiresAt > new Date()) {
        valid = true;
        await db.collection('otp_sessions').deleteOne({ phone });
      }
    } catch (err) {
      dbError = true;
      const session = globalStore.otpSessions[phone];
      if (session && session.otp === otp && session.expiresAt > new Date()) {
        valid = true;
        delete globalStore.otpSessions[phone];
      }
    }

    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    let userResponse: any = null;

    if (!dbError) {
      try {
        const client = await clientPromise;
        const db = client.db();
        
        let user: any = await db.collection('users').findOne({ phone });
        if (!user) {
          const newUserDoc: any = {
            phone,
            name: name?.trim() || '',
            isSubscribed: false,
            subscriptionExpiresAt: null,
            createdAt: new Date(),
            lastLoginAt: new Date()
          };
          const result = await db.collection('users').insertOne(newUserDoc);
          user = { ...newUserDoc, _id: result.insertedId };
        } else {
          const updateFields: any = { lastLoginAt: new Date() };
          if (name?.trim()) updateFields.name = name.trim();
          await db.collection('users').updateOne({ _id: user._id }, { $set: updateFields });
          if (name?.trim()) user.name = name.trim();
        }
        
        const userId = user._id.toString();
        await db.collection('sessions').insertOne({
          token,
          userId,
          phone,
          createdAt: new Date(),
          expiresAt
        });

        const isSubscribed = Boolean(
          user.isSubscribed && 
          user.subscriptionExpiresAt && 
          new Date(user.subscriptionExpiresAt) > new Date()
        );

        userResponse = {
          id: userId,
          phone,
          name: user.name || '',
          isSubscribed,
          subscriptionExpiresAt: user.subscriptionExpiresAt || null
        };
      } catch (err) {
        dbError = true;
      }
    }

    if (dbError) {
      // In-memory fallback
      let user = Object.values(globalStore.users).find((u: any) => u.phone === phone) as any;
      if (!user) {
        user = {
          id: crypto.randomUUID(),
          phone,
          name: name?.trim() || '',
          isSubscribed: false,
          subscriptionExpiresAt: null,
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
        globalStore.users[user.id] = user;
      } else {
        user.lastLoginAt = new Date();
        if (name?.trim()) user.name = name.trim();
      }
      
      globalStore.sessions[token] = {
        token,
        userId: user.id,
        phone,
        createdAt: new Date(),
        expiresAt
      };

      const isSubscribed = Boolean(
        user.isSubscribed && 
        user.subscriptionExpiresAt && 
        new Date(user.subscriptionExpiresAt) > new Date()
      );

      userResponse = {
        id: user.id,
        phone,
        name: user.name || '',
        isSubscribed,
        subscriptionExpiresAt: user.subscriptionExpiresAt || null
      };
    }

    return NextResponse.json({ success: true, token, user: userResponse });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
