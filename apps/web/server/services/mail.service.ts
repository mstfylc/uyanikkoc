type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type MailSendResult =
  | { status: "sent"; provider: "resend" }
  | { status: "skipped"; reason: "not_configured" };

function mailFrom(): string {
  return process.env.MAIL_FROM?.trim() || "Uyanık Koç <noreply@uyanikkoc.com>";
}

function resendApiKey(): string | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || null;
}

export async function sendMail(input: SendMailInput): Promise<MailSendResult> {
  const apiKey = resendApiKey();
  if (!apiKey) {
    return { status: "skipped", reason: "not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: mailFrom(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend email failed with status ${response.status}: ${detail.slice(0, 500)}`);
  }

  return { status: "sent", provider: "resend" };
}

export async function sendPasswordResetMail(input: {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
}): Promise<MailSendResult> {
  const text = [
    "Uyanık Koç şifre sıfırlama isteği aldık.",
    `Bağlantı: ${input.resetUrl}`,
    `Bu bağlantı ${input.expiresInMinutes} dakika geçerlidir.`,
    "Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.",
  ].join("\n\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h2>Uyanık Koç şifre sıfırlama</h2>
      <p>Şifrenizi yenilemek için aşağıdaki bağlantıya tıklayın.</p>
      <p><a href="${input.resetUrl}" style="display:inline-block;background:#534ab7;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Şifremi sıfırla</a></p>
      <p>Bu bağlantı ${input.expiresInMinutes} dakika geçerlidir.</p>
      <p>Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
    </div>
  `;

  return sendMail({
    to: input.to,
    subject: "Uyanık Koç şifre sıfırlama",
    html,
    text,
  });
}
