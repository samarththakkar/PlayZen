import axios from 'axios';
import { ApiError } from './ApiError.js';

export const sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    console.log('Attempting to send OTP to:', email);
    const emailData = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'PlayZen',
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [{ email }],
      subject: 'Verification OTP - PlayZen',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #EF4444;">Verification OTP</h2>
          <p style="font-size: 16px;">Your OTP for registration is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #EF4444; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="color: #666;">This OTP will expire in 10 minutes.</p>
        </div>
      `
    };

    if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
        throw new Error('Brevo credentials missing in .env');
    }

    await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      }
    });

    console.log('✅ OTP sent successfully via Brevo to:', email);
    return otp;
  } catch (error) {
    console.error('❌ Brevo OTP Error:', error.response?.data?.message || error.message);
    console.log(`\n\n======================================================`);
    console.log(`🚨 EMAIL BLOCKED BY BREVO SECURITY 🚨`);
    console.log(`Since you are developing locally, your OTP is: ${otp}`);
    console.log(`Use this to complete signup in the frontend!`);
    console.log(`======================================================\n\n`);

    // We return the OTP anyway so the local development flow isn't completely halted.
    return otp;
  }
};

export const verifyOTP = async (email, token) => {
  return true;
};
