/**
 * Email service using SendGrid
 * Configure SENDGRID_API_KEY in your environment variables
 */

interface EmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Base function to send email via SendGrid
 */
export async function sendEmail({ to, subject, html, text }: EmailParams) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
  const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@believersmatrimony.com'
  const FROM_NAME = process.env.FROM_NAME || 'Kaapi Connect'

  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject,
        content: [
          { type: 'text/plain', value: text || html.replace(/<[^>]*>/g, '') },
          { type: 'text/html', value: html }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('SendGrid error:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

/**
 * Email template wrapper
 */
function getEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kaapi Connect</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: 600;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kaapi Connect</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Connect Through Shared Interests & Kerala Roots</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Kaapi Connect. All rights reserved.</p>
          <p>You're receiving this email because you have an account with us.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://believersmatrimony.com'}/settings/notifications" style="color: #667eea;">Manage Email Preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const content = `
    <h2>Welcome to Kaapi Connect, ${name}!</h2>
    <p>We're thrilled to have you join our community of Kerala singles seeking meaningful connections.</p>
    <p>Here's how to get started:</p>
    <ol>
      <li><strong>Complete Your Profile</strong> - Add photos and details about yourself</li>
      <li><strong>Set Your Preferences</strong> - Tell us what you're looking for in a partner</li>
      <li><strong>Start Discovering</strong> - Browse profiles and connect with potential matches</li>
    </ol>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://believersmatrimony.com'}/onboarding" class="button">Complete Your Profile</a>
    <div class="divider"></div>
    <p><strong>Safety First:</strong> We're committed to creating a safe environment. Please review our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://believersmatrimony.com'}/safety">safety guidelines</a> and don't hesitate to report any suspicious activity.</p>
    <p>May God bless your journey to finding your life partner!</p>
  `

  return sendEmail({
    to,
    subject: 'Welcome to Kaapi Connect - Let\'s Get Started!',
    html: getEmailTemplate(content)
  })
}

/**
 * Send notification email for new match
 */
export async function sendMatchNotificationEmail(to: string, userName: string, matchName: string, matchId: string) {
  const content = `
    <h2>Congratulations, ${userName}!</h2>
    <p>You have a new match with <strong>${matchName}</strong>!</p>
    <p>This is an exciting moment - you've both expressed interest in each other. Now it's time to start a conversation and get to know each other better.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://believersmatrimony.com'}/matches/${matchId}" class="button">Start Chatting</a>
    <div class="divider"></div>
    <p><strong>Conversation Tips:</strong></p>
    <ul>
      <li>Be genuine and authentic</li>
      <li>Ask about their faith journey</li>
      <li>Share your values and life goals</li>
      <li>Take your time getting to know each other</li>
    </ul>
  `

  return sendEmail({
    to,
    subject: `New Match with ${matchName}!`,
    html: getEmailTemplate(content)
  })
}

/**
 * Send notification email when someone sends interest
 */
export async function sendInterestReceivedEmail(to: string, userName: string, senderName: string, senderId: string) {
  const content = `
    <h2>Hi ${userName}!</h2>
    <p><strong>${senderName}</strong> has sent you an interest!</p>
    <p>Someone special has shown interest in getting to know you better. Take a moment to view their profile and see if you'd like to connect.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://believersmatrimony.com'}/profile/${senderId}" class="button">View Profile</a>
    <div class="divider"></div>
    <p>If you're interested too, accept their interest to start a conversation. If not, that's okay - politely decline and continue your search.</p>
  `

  return sendEmail({
    to,
    subject: `${senderName} sent you an interest`,
    html: getEmailTemplate(content)
  })
}

/**
 * Send notification email for new message
 */
export async function sendMessageNotificationEmail(to: string, userName: string, senderName: string, messagePreview: string, matchId: string) {
  const content = `
    <h2>Hi ${userName}!</h2>
    <p>You have a new message from <strong>${senderName}</strong>:</p>
    <div style="background-color: #f8f9fa; padding: 15px; border-left: 3px solid #667eea; margin: 20px 0;">
      <p style="margin: 0;">"${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}"</p>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://believersmatrimony.com'}/matches/${matchId}" class="button">Reply Now</a>
    <div class="divider"></div>
    <p>Keep the conversation going and get to know each other better!</p>
  `

  return sendEmail({
    to,
    subject: `New message from ${senderName}`,
    html: getEmailTemplate(content)
  })
}

/**
 * Send daily matches summary email
 */
export async function sendDailyMatchesEmail(to: string, userName: string, matchCount: number, matches: Array<{ id: string, name: string, age: number, location: string }>) {
  const matchesList = matches.map(match => `
    <div style="background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px;">
      <h3 style="margin: 0 0 5px 0;">${match.name}</h3>
      <p style="margin: 0; color: #666;">${match.age} • ${match.location}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://believersmatrimony.com'}/profile/${match.id}" style="color: #667eea; text-decoration: none;">View Profile →</a>
    </div>
  `).join('')

  const content = `
    <h2>Good Morning, ${userName}!</h2>
    <p>We've found <strong>${matchCount} new potential matches</strong> for you today!</p>
    <p>These profiles align with your preferences and values. Take a look and see if any catch your eye:</p>
    ${matchesList}
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://believersmatrimony.com'}/discover" class="button">See All Matches</a>
    <div class="divider"></div>
    <p>Remember, the right person is worth the wait. May God guide you in your search!</p>
  `

  return sendEmail({
    to,
    subject: `Your Daily Matches - ${matchCount} New Profiles`,
    html: getEmailTemplate(content)
  })
}

/**
 * Send account verification email
 */
export async function sendVerificationEmail(to: string, name: string, verificationUrl: string) {
  const content = `
    <h2>Verify Your Email Address</h2>
    <p>Hi ${name},</p>
    <p>Thank you for joining Kaapi Connect! Please verify your email address to complete your registration and start connecting with other members.</p>
    <a href="${verificationUrl}" class="button">Verify Email Address</a>
    <div class="divider"></div>
    <p>If you didn't create an account with us, you can safely ignore this email.</p>
    <p style="font-size: 12px; color: #666;">This link will expire in 24 hours.</p>
  `

  return sendEmail({
    to,
    subject: 'Verify Your Email Address',
    html: getEmailTemplate(content)
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password for your Kaapi Connect account.</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <div class="divider"></div>
    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    <p style="font-size: 12px; color: #666;">This link will expire in 1 hour.</p>
  `

  return sendEmail({
    to,
    subject: 'Reset Your Password',
    html: getEmailTemplate(content)
  })
}
