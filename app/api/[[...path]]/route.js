import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

let client;
async function db() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
  }
  const name = process.env.DB_NAME || 'portfolio';
  return client.db(name);
}

const CONTACT_TO = 'kasycheva00@ukr.net';

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

async function sendContactEmail({ name, email, message }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Email service is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'Maria Portfolio <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO_EMAIL || CONTACT_TO],
      reply_to: email,
      subject: `Portfolio inquiry from ${name}`,
      text: `New portfolio message\n\nName: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:32px;background:#0a0a0a;color:#f5f5f0;border-radius:18px">
          <p style="margin:0 0 8px;color:#c5ff00;font-size:12px;letter-spacing:2px;text-transform:uppercase">New portfolio inquiry</p>
          <h1 style="margin:0 0 28px;font-size:28px">${escapeHtml(name)}</h1>
          <p style="margin:0 0 20px;color:#aaa">Reply to: <a href="mailto:${escapeHtml(email)}" style="color:#f5f5f0">${escapeHtml(email)}</a></p>
          <div style="padding:20px;background:#151515;border:1px solid #2a2a2a;border-radius:12px;white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const providerError = await response.text();
    console.error('[contact] Resend rejected request', response.status, providerError);
    let providerMessage = 'Email provider rejected the request';
    try {
      providerMessage = JSON.parse(providerError).message || providerMessage;
    } catch (_parseError) {}
    throw new Error(providerMessage);
  }
}

export async function GET(_req, { params }) {
  const path = (params?.path || []).join('/');
  if (path === 'health' || path === '') return NextResponse.json({ ok: true, service: 'maria-portfolio' });
  return NextResponse.json({ error: 'not found' }, { status: 404 });
}

export async function POST(req, { params }) {
  const path = (params?.path || []).join('/');
  if (path === 'contact') {
    try {
      const body = await req.json();
      const name = String(body.name || '').trim().slice(0, 80);
      const email = String(body.email || '').trim().toLowerCase().slice(0, 160);
      const message = String(body.message || '').trim().slice(0, 4000);
      const website = String(body.website || '').trim();

      // Honeypot fields are invisible to people. Silently accept bot posts.
      if (website) return NextResponse.json({ ok: true });
      if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ ok: false, error: 'Invalid form data' }, { status: 400 });
      }

      await sendContactEmail({ name, email, message });

      // Keep Mongo as an optional backup when the project has it configured.
      if (process.env.MONGO_URL) {
        try {
          const d = await db();
          await d.collection('contacts').insertOne({ name, email, message, createdAt: new Date(), id: crypto.randomUUID() });
        } catch (_dbError) {
          // Email delivery is the primary action; a backup failure must not
          // make the visitor retry and send Maria a duplicate message.
        }
      }
      return NextResponse.json({ ok: true });
    } catch (_error) {
      return NextResponse.json({ ok: false, error: 'Unable to send message' }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'not found' }, { status: 404 });
}
