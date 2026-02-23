const axios = require('axios');

/**
 * SMS Service for sending OTP via multiple providers
 * Supports: MSG91, Twilio, AWS SNS, Fast2SMS
 */

class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'MSG91';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Send SMS using configured provider
   * @param {string} phone - 10-digit mobile number
   * @param {string} message - SMS content
   * @returns {Promise<Object>} - Response from SMS provider
   */
  async sendSMS(phone, message) {
    // In development, just log to console
    if (this.isDevelopment && !process.env.SMS_ENABLED) {
      console.log(`\n📱 [DEV MODE] SMS to ${phone}:`);
      console.log(`   Message: ${message}`);
      console.log(`   (Set SMS_ENABLED=true in .env to send real SMS)\n`);
      return { success: true, mode: 'development' };
    }

    try {
      switch (this.provider) {
        case 'MSG91':
          return await this.sendViaMSG91(phone, message);
        case 'TWILIO':
          return await this.sendViaTwilio(phone, message);
        case 'FAST2SMS':
          return await this.sendViaFast2SMS(phone, message);
        case 'AWS_SNS':
          return await this.sendViaAWS(phone, message);
        default:
          throw new Error(`Unknown SMS provider: ${this.provider}`);
      }
    } catch (error) {
      console.error(`❌ SMS Error (${this.provider}):`, error.message);
      throw error;
    }
  }

  /**
   * Send OTP SMS (convenience method)
   * @param {string} phone - 10-digit mobile number
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<Object>}
   */
  async sendOTP(phone, otp) {
    const message = `Your LegalIQ OTP is ${otp}. Valid for 5 minutes. Do not share with anyone. - LegalIQ`;
    return await this.sendSMS(phone, message);
  }

  /**
   * MSG91 SMS Provider (Recommended for India)
   * Docs: https://docs.msg91.com/p/tf9GTextN/e/Oq9so-Wd1/MSG91
   */
  async sendViaMSG91(phone, message) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const senderId = process.env.MSG91_SENDER_ID || 'LGALIQ';
    const route = process.env.MSG91_ROUTE || '4'; // 4 = Transactional
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey) {
      throw new Error('MSG91_AUTH_KEY not configured in .env');
    }

    try {
      // MSG91 API v5
      // Use MSG91 SMS API (not Flow API) for simple OTP
      const response = await axios.get(
        'https://api.msg91.com/api/sendhttp.php',
        {
          params: {
            authkey: authKey,
            mobiles: phone,
            message: message,
            sender: senderId,
            route: route,
            country: '91'
          }
        }
      );

      console.log(`✅ MSG91 SMS sent to ${phone}`);
      console.log(`   Response:`, response.data);
      
      return {
        success: true,
        provider: 'MSG91',
        response: response.data
      };
    } catch (error) {
      console.error('MSG91 Error:', error.response?.data || error.message);
      throw new Error(`MSG91 SMS failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Twilio SMS Provider (Global)
   * Docs: https://www.twilio.com/docs/sms
   */
  async sendViaTwilio(phone, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured in .env');
    }

    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({
          To: `+91${phone}`,
          From: fromNumber,
          Body: message
        }),
        {
          auth: {
            username: accountSid,
            password: authToken
          }
        }
      );

      console.log(`✅ Twilio SMS sent to ${phone}`);
      return {
        success: true,
        provider: 'Twilio',
        response: response.data
      };
    } catch (error) {
      console.error('Twilio Error:', error.response?.data || error.message);
      throw new Error(`Twilio SMS failed: ${error.message}`);
    }
  }

  /**
   * Fast2SMS Provider (India - Budget option)
   * Docs: https://docs.fast2sms.com/
   */
  async sendViaFast2SMS(phone, message) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    const senderId = process.env.FAST2SMS_SENDER_ID || 'LGALIQ';

    if (!apiKey) {
      throw new Error('FAST2SMS_API_KEY not configured in .env');
    }

    try {
      const response = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          route: 'v3',
          sender_id: senderId,
          message: message,
          language: 'english',
          flash: 0,
          numbers: phone
        },
        {
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Fast2SMS sent to ${phone}`);
      return {
        success: true,
        provider: 'Fast2SMS',
        response: response.data
      };
    } catch (error) {
      console.error('Fast2SMS Error:', error.response?.data || error.message);
      throw new Error(`Fast2SMS failed: ${error.message}`);
    }
  }

  /**
   * AWS SNS Provider
   * Docs: https://docs.aws.amazon.com/sns/
   */
  async sendViaAWS(phone, message) {
    // Note: AWS SDK would need to be installed separately
    // npm install @aws-sdk/client-sns
    throw new Error('AWS SNS not implemented yet. Install @aws-sdk/client-sns and configure.');
  }

  /**
   * Validate Indian mobile number
   * @param {string} phone - Phone number to validate
   * @returns {boolean}
   */
  static isValidIndianNumber(phone) {
    return /^[6-9]\d{9}$/.test(phone);
  }

  /**
   * Format phone number for display
   * @param {string} phone - 10-digit number
   * @returns {string} - Formatted as +91-XXXXX-XXXXX
   */
  static formatPhone(phone) {
    if (phone.length === 10) {
      return `+91-${phone.slice(0, 5)}-${phone.slice(5)}`;
    }
    return phone;
  }
}

module.exports = new SMSService();
