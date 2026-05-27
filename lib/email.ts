// lib/email.ts
// Centraliza envio de emails via Resend.
// Se RESEND_API_KEY não estiver configurada, loga aviso e retorna sem erro.

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.EMAIL_FROM ?? 'CoachHub Fit <noreply@coachhub.fit>'
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')

// ── Tipos ──────────────────────────────────────────────
export interface NewLeadEmailData {
  // Para o coach
  coachEmail: string
  coachName: string
  coachProfileId: string
  // Dados do lead
  studentName: string
  studentContact: string
  studentGoal: string | null
  studentMessage: string | null
  planName: string | null
  planPriceBrl: number | null // centavos
}

export interface LeadConfirmationEmailData {
  studentEmail: string
  studentName: string
  coachName: string
  coachProfileId: string
  planName: string | null
}

// ── Helper: formata preço ──────────────────────────────
function fmt(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

// ── Email 1: novo lead → coach ─────────────────────────
export async function sendNewLeadEmail(data: NewLeadEmailData): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY não configurada — email não enviado.')
    return
  }

  const dashUrl = `${APP_URL}/coach/leads`
  const contactIsPhone = /^\d{8,15}$/.test(data.studentContact.replace(/\D/g, ''))
  const whatsappUrl = contactIsPhone
    ? `https://wa.me/55${data.studentContact.replace(/\D/g, '')}`
    : null

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Novo lead — CoachHub Fit</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:#101010;">

        <!-- Header -->
        <tr>
          <td style="padding:0;">
            <div style="height:3px;background:linear-gradient(90deg,transparent,#39FF7A,transparent);"></div>
            <div style="padding:28px 32px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:8px;">
                      <div style="width:28px;height:28px;border-radius:8px;background:#39FF7A;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;color:#080808;">CH</div>
                      <span style="font-weight:700;font-size:15px;color:#F2F2F0;">CoachHub <span style="color:#39FF7A;">Fit</span></span>
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;font-weight:600;color:#39FF7A;background:rgba(57,255,122,0.1);border:1px solid rgba(57,255,122,0.2);border-radius:20px;padding:4px 10px;">
                      Novo lead
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">
              Olá, ${data.coachName.split(' ')[0]}
            </p>
            <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#F2F2F0;line-height:1.2;">
              Você recebeu um novo lead!
            </h1>
            <p style="margin:0 0 24px;font-size:14px;color:#9A9A8E;line-height:1.6;">
              ${data.studentName} demonstrou interesse no seu perfil${data.planName ? ` e no plano <strong style="color:#F2F2F0;">${data.planName}</strong>` : ''}.
            </p>

            <!-- Lead card -->
            <div style="background:#181818;border-radius:14px;border:1px solid rgba(255,255,255,0.07);padding:20px;margin-bottom:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Nome -->
                <tr>
                  <td style="padding-bottom:14px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div style="width:36px;height:36px;border-radius:10px;background:rgba(57,255,122,0.1);border:1px solid rgba(57,255,122,0.2);display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:#39FF7A;flex-shrink:0;">
                        ${data.studentName.split(' ').slice(0,2).map((n: string) => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p style="margin:0;font-size:15px;font-weight:700;color:#F2F2F0;">${data.studentName}</p>
                        <p style="margin:2px 0 0;font-size:12px;color:#555550;">Novo lead</p>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Divider -->
                <tr><td style="padding-bottom:14px;border-top:1px solid rgba(255,255,255,0.05);"></td></tr>

                <!-- Contato -->
                <tr>
                  <td style="padding-bottom:10px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#555550;text-transform:uppercase;letter-spacing:0.06em;">Contato</p>
                    <p style="margin:0;font-size:14px;color:#F2F2F0;">${data.studentContact}</p>
                  </td>
                </tr>

                ${data.studentGoal ? `
                <!-- Objetivo -->
                <tr>
                  <td style="padding-bottom:10px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#555550;text-transform:uppercase;letter-spacing:0.06em;">Objetivo</p>
                    <p style="margin:0;font-size:14px;color:#F2F2F0;">${data.studentGoal}</p>
                  </td>
                </tr>` : ''}

                ${data.planName ? `
                <!-- Plano -->
                <tr>
                  <td style="padding-bottom:10px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#555550;text-transform:uppercase;letter-spacing:0.06em;">Plano de interesse</p>
                    <p style="margin:0;font-size:14px;color:#39FF7A;font-weight:600;">
                      ${data.planName}${data.planPriceBrl ? ` · ${fmt(data.planPriceBrl)}/mês` : ''}
                    </p>
                  </td>
                </tr>` : ''}

                ${data.studentMessage ? `
                <!-- Mensagem -->
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#555550;text-transform:uppercase;letter-spacing:0.06em;">Mensagem</p>
                    <p style="margin:0;font-size:14px;color:#9A9A8E;line-height:1.6;font-style:italic;">"${data.studentMessage}"</p>
                  </td>
                </tr>` : ''}

              </table>
            </div>

            <!-- CTAs -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${whatsappUrl ? `
                <td style="padding-right:8px;">
                  <a href="${whatsappUrl}" style="display:block;text-align:center;background:#39FF7A;color:#080808;font-weight:700;font-size:14px;text-decoration:none;border-radius:12px;padding:13px 20px;">
                    Responder no WhatsApp
                  </a>
                </td>` : ''}
                <td>
                  <a href="${dashUrl}" style="display:block;text-align:center;background:#181818;color:#F2F2F0;font-weight:600;font-size:14px;text-decoration:none;border-radius:12px;padding:13px 20px;border:1px solid rgba(255,255,255,0.1);">
                    Ver no painel
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:11px;color:#555550;text-align:center;">
              Você recebeu este e-mail porque tem um perfil ativo no CoachHub Fit.<br/>
              <a href="${APP_URL}" style="color:#39FF7A;text-decoration:none;">coachhub.fit</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: FROM,
      to: data.coachEmail,
      subject: `Novo interesse: ${data.studentName} quer conhecer seu trabalho`,
      html,
    })
  } catch (err) {
    console.error('[email] Erro ao enviar email para coach:', err)
    // Não propaga — lead já foi salvo, email é best-effort
  }
}

// ── Email 2: confirmação → aluno ───────────────────────
export async function sendLeadConfirmationEmail(data: LeadConfirmationEmailData): Promise<void> {
  if (!resend) return

  const profileUrl = `${APP_URL}/coaches/${data.coachProfileId}`

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:#101010;">

        <tr>
          <td>
            <div style="height:3px;background:linear-gradient(90deg,transparent,#39FF7A,transparent);"></div>
            <div style="padding:28px 32px;">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="width:56px;height:56px;border-radius:16px;background:rgba(57,255,122,0.1);border:1px solid rgba(57,255,122,0.25);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                  <span style="font-size:24px;">✓</span>
                </div>
                <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#F2F2F0;">Interesse enviado!</h1>
                <p style="margin:0;font-size:14px;color:#9A9A8E;line-height:1.6;">
                  <strong style="color:#F2F2F0;">${data.coachName.split(' ')[0]}</strong> recebeu seu interesse
                  ${data.planName ? ` no plano <strong style="color:#39FF7A;">${data.planName}</strong>` : ''} e vai entrar em contato em breve.
                </p>
              </div>

              <div style="background:#181818;border-radius:12px;padding:16px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.06);">
                <p style="margin:0 0 6px;font-size:12px;color:#555550;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">O que acontece agora?</p>
                <ul style="margin:0;padding-left:0;list-style:none;">
                  ${['Fique atento ao WhatsApp ou Instagram que você informou', `${data.coachName.split(' ')[0]} tem até 48h para responder`, 'Você pode enviar interesse para outros coaches enquanto aguarda'].map(item => `
                  <li style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;font-size:13px;color:#9A9A8E;">
                    <span style="color:#39FF7A;flex-shrink:0;margin-top:1px;">→</span> ${item}
                  </li>`).join('')}
                </ul>
              </div>

              <a href="${profileUrl}" style="display:block;text-align:center;background:#181818;color:#F2F2F0;font-weight:600;font-size:14px;text-decoration:none;border-radius:12px;padding:13px;border:1px solid rgba(255,255,255,0.1);margin-bottom:16px;">
                Ver perfil de ${data.coachName.split(' ')[0]}
              </a>

              <p style="margin:0;font-size:11px;color:#555550;text-align:center;">
                CoachHub Fit · <a href="${APP_URL}/coaches" style="color:#39FF7A;text-decoration:none;">Explorar mais coaches</a>
              </p>
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: FROM,
      to: data.studentEmail,
      subject: `Seu interesse foi enviado para ${data.coachName.split(' ')[0]} — CoachHub Fit`,
      html,
    })
  } catch (err) {
    console.error('[email] Erro ao enviar confirmação para aluno:', err)
  }
}
