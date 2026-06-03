import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'lilllechris06@gmail.com',
    subject: `New message from ${name}`,
    text: `Email: ${email}\n\nMessage: ${message}`,
  });

  return Response.json({ success: true });
}
