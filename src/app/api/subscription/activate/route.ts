import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';

const globalStore = global as any;
if (!globalStore.sessions) globalStore.sessions = {};
if (!globalStore.users) globalStore.users = {};
if (!globalStore.subscriptions) globalStore.subscriptions = [];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId = null;
    let phone = null;

    try {
      const client = await clientPromise;
      const db = client.db();
      const session = await db.collection('sessions').findOne({ token });
      if (session && session.expiresAt > new Date()) {
        userId = session.userId;
        phone = session.phone;
      }
    } catch {
      const session = globalStore.sessions[token];
      if (session && session.expiresAt > new Date()) {
        userId = session.userId;
        phone = session.phone;
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized or expired session' }, { status: 401 });
    }

    // 180 days = 6 months subscription
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    const referenceId = `SUB-6M-${crypto.randomInt(100000, 999999)}`;

    const paymentRecord = {
      referenceId,
      userId,
      phone,
      plan: '6_months_access',
      amount: 999,
      currency: 'INR',
      status: 'completed',
      paymentMethod: 'test_simulation',
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    let updated = false;

    try {
      const client = await clientPromise;
      const db = client.db();
      const { ObjectId } = await import('mongodb');

      try {
        await db.collection('users').updateOne(
          { _id: new ObjectId(userId) },
          { $set: { isSubscribed: true, subscriptionExpiresAt: expiresAt } }
        );
        updated = true;
      } catch {
        await db.collection('users').updateOne(
          { _id: userId },
          { $set: { isSubscribed: true, subscriptionExpiresAt: expiresAt } }
        );
        updated = true;
      }

      if (!updated && phone) {
        await db.collection('users').updateOne(
          { phone },
          { $set: { isSubscribed: true, subscriptionExpiresAt: expiresAt } }
        );
      }

      await db.collection('subscription_payments').insertOne(paymentRecord);
    } catch (err) {
      console.warn('MongoDB subscription activate fallback to in-memory:', err);
    }

    // Always update in-memory fallback
    if (globalStore.users[userId]) {
      globalStore.users[userId].isSubscribed = true;
      globalStore.users[userId].subscriptionExpiresAt = expiresAt;
    }
    const userByPhone = Object.values(globalStore.users).find((u: any) => u.phone === phone) as any;
    if (userByPhone) {
      userByPhone.isSubscribed = true;
      userByPhone.subscriptionExpiresAt = expiresAt;
    }
    globalStore.subscriptions.push(paymentRecord);

    return NextResponse.json({
      success: true,
      message: 'Subscription activated for 6 months',
      referenceId,
      isSubscribed: true,
      subscriptionExpiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Subscription activation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
