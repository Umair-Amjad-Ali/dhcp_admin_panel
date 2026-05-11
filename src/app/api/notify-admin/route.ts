import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const authHeader = req.headers.get('Authorization');
    const expectedKey = process.env.NOTIFICATION_API_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { title, message, orderId } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const db = admin.firestore();
    await db.collection('admin_notifications').add({
      title,
      body: message,
      orderId: orderId || null,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const tokensSnapshot = await db.collection('admin_fcm_tokens').get();
    
    if (tokensSnapshot.empty) {
      return NextResponse.json({ message: 'Notification saved, no FCM tokens found' }, { status: 200, headers: corsHeaders });
    }

    const tokens: string[] = [];
    tokensSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      return NextResponse.json({ message: 'Notification saved, no valid tokens' }, { status: 200, headers: corsHeaders });
    }
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: title,
        body: message,
      },
    });

    return NextResponse.json({ 
      success: true, 
      sentCount: response.successCount,
      failedCount: response.failureCount
    }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
