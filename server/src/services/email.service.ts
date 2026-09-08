/**
 * Email Service using Brevo (formerly Sendinblue) Transactional API
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Safely escape user-controlled values to prevent HTML/template injection in emails.
 */
function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class EmailService {
  private static getApiKey(): string {
    return process.env.BREVO_API_KEY || '';
  }

  private static getSenderEmail(): string {
    return process.env.BREVO_SENDER_EMAIL || 'dagiderbe59@gmail.com';
  }

  private static getSenderName(): string {
    return process.env.BREVO_SENDER_NAME || 'Jonny Livestock';
  }

  public static async sendVerificationOtp(
    recipientEmail: string,
    recipientName: string,
    otpCode: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const apiKey = this.getApiKey();
      const senderEmail = this.getSenderEmail();
      const senderName = this.getSenderName();
      const safeRecipientName = escapeHtml(recipientName?.trim() || 'Valued Customer');

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jonny Livestock Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2A1A0D;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F5F0; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); border: 1px solid #EBE3D5;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #1B1208 0%, #2E1D0E 100%); padding: 36px 30px 30px 30px; border-bottom: 3px solid #C18A45;">
              <div style="display: inline-block; padding: 10px 18px; border-radius: 12px; background-color: rgba(193, 138, 69, 0.15); border: 1px solid rgba(193, 138, 69, 0.3); margin-bottom: 12px;">
                <span style="color: #E0B15A; font-weight: 800; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">JONNY LIVESTOCK</span>
              </div>
              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; font-family: Georgia, serif;">Verify Your Email Address</h1>
              <p style="color: #D8C5A8; font-size: 13px; margin: 8px 0 0 0; opacity: 0.85;">Welcome to Ethiopia's Prime Livestock & Holiday Packages</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="font-size: 15px; margin: 0 0 14px 0; color: #3E2B1E; line-height: 1.6;">
                Hello <strong>${safeRecipientName}</strong>,
              </p>
              <p style="font-size: 14px; margin: 0 0 24px 0; color: #604C3E; line-height: 1.6;">
                Thank you for signing up with Jonny Livestock. Please use the 6-digit one-time verification code below to complete your registration:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #FDF9F2; border: 2px dashed #C18A45; border-radius: 16px; padding: 24px 15px; text-align: center; margin-bottom: 24px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8F6026; margin-bottom: 8px;">
                  Your Verification Code
                </div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #C18A45; text-shadow: 0 2px 4px rgba(193,138,69,0.15);">
                  ${otpCode}
                </div>
                <div style="font-size: 12px; color: #9E7950; margin-top: 8px;">
                  ⏱️ Valid for <strong>10 minutes</strong>
                </div>
              </div>

              <!-- Security Information -->
              <div style="background-color: #F5EFEB; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="24" valign="top" style="font-size: 16px; padding-right: 10px;">🔒</td>
                    <td style="font-size: 12px; color: #6E533F; line-height: 1.5;">
                      <strong>Security Tip:</strong> Never share this code with anyone. Jonny Livestock will never ask for your code via phone, SMS, or social media.
                    </td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 12px; color: #8A7565; margin: 0; line-height: 1.5;">
                If you did not attempt to create an account with Jonny Livestock, please safely disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #F8F5F0; padding: 22px 30px; border-top: 1px solid #EBE3D5; font-size: 11px; color: #8A7565;">
              <div style="font-weight: 700; color: #4A3222; margin-bottom: 4px;">Jonny Livestock Trading PLC</div>
              <div>Belay Zeleke Street, Arat Kilo, Addis Ababa, Ethiopia • Tel: +251 910 194 903</div>
              <div style="margin-top: 8px; opacity: 0.6;">© ${new Date().getFullYear()} Jonny Livestock. All rights reserved.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail
          },
          to: [
            {
              email: recipientEmail.trim().toLowerCase(),
              name: recipientName.trim()
            }
          ],
          subject: `${otpCode} is your Jonny Livestock verification code`,
          htmlContent
        })
      });

      const data: any = await response.json();

      if (!response.ok) {
        console.error('Brevo API Error:', data);
        return {
          success: false,
          error: data.message || 'Failed to dispatch email verification code via Brevo'
        };
      }

      return {
        success: true,
        messageId: data.messageId
      };
    } catch (error: any) {
      console.error('Error sending verification OTP via Brevo:', error);
      return {
        success: false,
        error: error.message || 'Failed to dispatch verification email'
      };
    }
  }

  public static async sendPasswordResetOtp(
    recipientEmail: string,
    recipientName: string,
    otpCode: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const apiKey = this.getApiKey();
      const senderEmail = this.getSenderEmail();
      const senderName = this.getSenderName();
      const safeRecipientName = escapeHtml(recipientName?.trim() || 'Customer');

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Jonny Livestock Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2A1A0D;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F5F0; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); border: 1px solid #EBE3D5;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #1B1208 0%, #2E1D0E 100%); padding: 36px 30px 30px 30px; border-bottom: 3px solid #C18A45;">
              <div style="display: inline-block; padding: 10px 18px; border-radius: 12px; background-color: rgba(193, 138, 69, 0.15); border: 1px solid rgba(193, 138, 69, 0.3); margin-bottom: 12px;">
                <span style="color: #E0B15A; font-weight: 800; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">JONNY LIVESTOCK</span>
              </div>
              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; font-family: Georgia, serif;">Password Reset Code</h1>
              <p style="color: #D8C5A8; font-size: 13px; margin: 8px 0 0 0; opacity: 0.85;">Secure Password Recovery</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="font-size: 15px; margin: 0 0 14px 0; color: #3E2B1E; line-height: 1.6;">
                Hello <strong>${safeRecipientName}</strong>,
              </p>
              <p style="font-size: 14px; margin: 0 0 24px 0; color: #604C3E; line-height: 1.6;">
                We received a request to reset the password for your Jonny Livestock account. Please use the 6-digit verification code below to set a new password:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #FDF9F2; border: 2px dashed #C18A45; border-radius: 16px; padding: 24px 15px; text-align: center; margin-bottom: 24px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8F6026; margin-bottom: 8px;">
                  Password Reset Code
                </div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #C18A45; text-shadow: 0 2px 4px rgba(193,138,69,0.15);">
                  ${otpCode}
                </div>
                <div style="font-size: 12px; color: #9E7950; margin-top: 8px;">
                  ⏱️ Valid for <strong>10 minutes</strong>
                </div>
              </div>

              <!-- Security Information -->
              <div style="background-color: #F5EFEB; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="24" valign="top" style="font-size: 16px; padding-right: 10px;">🔒</td>
                    <td style="font-size: 12px; color: #6E533F; line-height: 1.5;">
                      <strong>Security Tip:</strong> If you did not request a password reset, you can safely ignore this email. Your current password remains safe and unchanged.
                    </td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 12px; color: #8A7565; margin: 0; line-height: 1.5;">
                For your protection, never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #F8F5F0; padding: 22px 30px; border-top: 1px solid #EBE3D5; font-size: 11px; color: #8A7565;">
              <div style="font-weight: 700; color: #4A3222; margin-bottom: 4px;">Jonny Livestock Trading PLC</div>
              <div>Belay Zeleke Street, Arat Kilo, Addis Ababa, Ethiopia • Tel: +251 910 194 903</div>
              <div style="margin-top: 8px; opacity: 0.6;">© ${new Date().getFullYear()} Jonny Livestock. All rights reserved.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail
          },
          to: [
            {
              email: recipientEmail.trim().toLowerCase(),
              name: recipientName.trim()
            }
          ],
          subject: `${otpCode} is your Jonny Livestock password reset code`,
          htmlContent
        })
      });

      const data: any = await response.json();

      if (!response.ok) {
        console.error('Brevo API Error:', data);
        return {
          success: false,
          error: data.message || 'Failed to dispatch password reset email via Brevo'
        };
      }

      return {
        success: true,
        messageId: data.messageId
      };
    } catch (error: any) {
      console.error('Error sending password reset OTP via Brevo:', error);
      return {
        success: false,
        error: error.message || 'Failed to dispatch password reset email'
      };
    }
  }
}
