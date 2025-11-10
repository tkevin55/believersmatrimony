/**
 * SMS/WhatsApp Utility Functions
 *
 * This module handles sending verification messages via SMS or WhatsApp.
 * Currently using placeholder implementation. In production, integrate with:
 * - Twilio (SMS/WhatsApp)
 * - MSG91
 * - AWS SNS
 * - Or any other SMS provider
 */

export async function sendVerificationSMS(
  phoneNumber: string,
  message: string,
  verificationUrl: string
): Promise<void> {
  console.log('=== SMS VERIFICATION REQUEST ===')
  console.log('To:', phoneNumber)
  console.log('Message:', message)
  console.log('Verification URL:', verificationUrl)
  console.log('================================')

  // TODO: Integrate with actual SMS provider
  // Example implementations:

  // TWILIO Example:
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phoneNumber
  // });

  // MSG91 Example:
  // const response = await fetch('https://api.msg91.com/api/v5/flow/', {
  //   method: 'POST',
  //   headers: {
  //     'authkey': process.env.MSG91_AUTH_KEY,
  //     'content-type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     flow_id: process.env.MSG91_FLOW_ID,
  //     sender: process.env.MSG91_SENDER_ID,
  //     mobiles: phoneNumber,
  //     VAR1: verificationUrl
  //   })
  // });

  // For development/testing, just log the message
  if (process.env.NODE_ENV === 'development') {
    console.log('📱 Development Mode: SMS not actually sent')
    return Promise.resolve()
  }

  // In production, throw error if SMS provider not configured
  if (!process.env.SMS_PROVIDER_CONFIGURED) {
    console.warn('⚠️ SMS provider not configured. Message not sent.')
    // Don't throw error to allow verification flow to continue
    return Promise.resolve()
  }

  // Actual SMS sending logic would go here
  return Promise.resolve()
}

export async function sendVerificationWhatsApp(
  phoneNumber: string,
  message: string,
  verificationUrl: string
): Promise<void> {
  console.log('=== WHATSAPP VERIFICATION REQUEST ===')
  console.log('To:', phoneNumber)
  console.log('Message:', message)
  console.log('Verification URL:', verificationUrl)
  console.log('====================================')

  // TODO: Integrate with WhatsApp Business API
  // Example using Twilio WhatsApp:
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: message,
  //   from: 'whatsapp:+14155238886', // Twilio sandbox number
  //   to: `whatsapp:${phoneNumber}`
  // });

  // For development, just log
  if (process.env.NODE_ENV === 'development') {
    console.log('📱 Development Mode: WhatsApp message not actually sent')
    return Promise.resolve()
  }

  // In production, throw error if WhatsApp not configured
  if (!process.env.WHATSAPP_PROVIDER_CONFIGURED) {
    console.warn('⚠️ WhatsApp provider not configured. Message not sent.')
    return Promise.resolve()
  }

  return Promise.resolve()
}

/**
 * Format phone number for international SMS
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '')

  // Add country code if not present (assuming India +91 by default)
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned
  }

  // Add + prefix
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned
  }

  return cleaned
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{4,}$/
  return phoneRegex.test(phone)
}

/**
 * Send SMS reminder for pending verifications
 */
export async function sendVerificationReminder(
  phoneNumber: string,
  pastorName: string,
  userName: string,
  verificationUrl: string
): Promise<void> {
  const message = `Reminder: ${userName} is waiting for your church verification on Believers Matrimony.

Please verify: ${verificationUrl}

This link expires soon.

- Believers Matrimony`

  return sendVerificationSMS(phoneNumber, message, verificationUrl)
}
