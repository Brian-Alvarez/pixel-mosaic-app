import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  await sgMail.send({
    to,
    from: 'no-reply@pixelmosaic.app', // must be verified in SendGrid
    subject: 'Reset your password',
    html: `
      <h2>Reset your Pixel Mosaic password</h2>
      <p>Click below to set a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour.</p>
    `,
  });
}
