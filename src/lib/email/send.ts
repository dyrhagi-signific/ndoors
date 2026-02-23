import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Ndoors <no-reply@mail.ndoors.se>'
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/**
 * Email sent to a referent asking them to confirm they're happy to be contacted.
 */
export async function sendReferentInvite({
  referentEmail,
  referentName,
  applicantName,
  jobTitle,
  companyName,
  confirmToken,
}: {
  referentEmail: string
  referentName: string
  applicantName: string
  jobTitle: string
  companyName: string
  confirmToken: string
}) {
  const confirmUrl = `${appUrl}/confirm/${confirmToken}`

  return resend.emails.send({
    from: FROM,
    to: referentEmail,
    subject: `${applicantName} has listed you as a reference`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a18">
        <p style="margin-bottom:16px">Hi ${referentName},</p>
        <p style="margin-bottom:16px">
          <strong>${applicantName}</strong> is applying for the role of
          <strong>${jobTitle}</strong> at <strong>${companyName}</strong>
          and has listed you as a reference.
        </p>
        <p style="margin-bottom:24px">
          By clicking below you confirm you're happy to be contacted by the recruiter
          about this specific role. Your details will only be shared with the hiring
          team at ${companyName} for this position.
        </p>
        <a href="${confirmUrl}"
           style="display:inline-block;background:#2d5a3d;color:#fff;padding:12px 28px;
                  border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
          Confirm I'm happy to be a reference
        </a>
        <p style="margin-top:24px;color:#777770;font-size:13px">
          You can also decline via the link above if you'd prefer not to be contacted.
        </p>
      </div>
    `,
  })
}

/**
 * Email sent to the recruiter when a referent confirms.
 */
export async function sendRecruiterNotification({
  recruiterEmail,
  recruiterName,
  referentName,
  referentEmail,
  applicantName,
  jobTitle,
}: {
  recruiterEmail: string
  recruiterName: string
  referentName: string
  referentEmail: string
  applicantName: string
  jobTitle: string
}) {
  return resend.emails.send({
    from: FROM,
    to: recruiterEmail,
    subject: `${referentName} confirmed as reference for ${applicantName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a18">
        <p style="margin-bottom:16px">Hi ${recruiterName},</p>
        <p style="margin-bottom:16px">
          <strong>${referentName}</strong> has confirmed they're happy to be contacted
          as a reference for <strong>${applicantName}</strong> (${jobTitle}).
        </p>
        <p style="margin-bottom:8px">
          You can now reach them at: <a href="mailto:${referentEmail}">${referentEmail}</a>
        </p>
        <p style="margin-top:24px">
          <a href="${appUrl}/dashboard"
             style="display:inline-block;background:#2d5a3d;color:#fff;padding:10px 22px;
                    border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            View dashboard
          </a>
        </p>
      </div>
    `,
  })
}
