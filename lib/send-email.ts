import 'server-only';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export function emailConfigured(): boolean {
  return Boolean((process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) || process.env.RESEND_API_KEY);
}

// Sends through Gmail (App Password) when configured, otherwise through Resend.
// Throws on failure.
export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (user && pass) {
    const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    await transport.sendMail({ from: `RE Platform <${user}>`, to: opts.to, subject: opts.subject, html: opts.html });
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM || 'RE Platform <onboarding@resend.dev>',
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) throw new Error('Resend: ' + JSON.stringify(error));
}
