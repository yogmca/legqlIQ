const axios = require('axios');

/**
 * MSG91 WhatsApp Service for LegalIQ
 * 
 * Sends WhatsApp messages via MSG91's WhatsApp API.
 * No DLT registration required for WhatsApp messages (DLT is only for SMS in India).
 * 
 * MSG91 WhatsApp API uses pre-approved templates that you create in the MSG91 dashboard.
 * Templates must be approved by WhatsApp/Meta before they can be used.
 * 
 * Setup Steps:
 * 1. Create MSG91 account at https://msg91.com
 * 2. Enable WhatsApp channel in MSG91 dashboard
 * 3. Get your Auth Key from MSG91 dashboard
 * 4. Create WhatsApp templates in MSG91 dashboard (see template names below)
 * 5. Get the Integrated Number ID from MSG91 WhatsApp settings
 * 6. Add credentials to .env file
 * 
 * Required Templates in MSG91 Dashboard:
 * - new_user_signup: For new user registration notifications
 * - new_professional_signup: For new professional registration notifications  
 * - welcome_user: Welcome message to newly registered users
 * - welcome_professional: Welcome message to newly registered professionals
 * - consultation_booked_client: Confirmation to client when booking consultation
 * - consultation_booked_professional: Notification to professional about new booking
 * - consultation_booked_admin: Admin notification about new booking
 * - video_consultation_booked_client: Confirmation to client for video consultation
 * - video_consultation_booked_professional: Notification to professional for video booking
 * - appointment_accepted_client: Client notification when appointment is accepted
 * - appointment_accepted_professional: Professional confirmation of acceptance
 * - appointment_rescheduled_client: Client notification when appointment is rescheduled
 * - appointment_rescheduled_professional: Professional confirmation of reschedule
 * - appointment_cancelled_client: Client notification when appointment is cancelled
 * - appointment_cancelled_professional: Professional notification of cancellation
 */

class WhatsAppService {
  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.integratedNumberId = process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER_ID;
    this.namespace = process.env.MSG91_WHATSAPP_NAMESPACE;
    this.adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '';
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isEnabled = process.env.WHATSAPP_ENABLED === 'true';
    this.baseUrl = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';
    
    // Log configuration status on startup
    console.log('📱 WhatsApp Service Configuration:');
    console.log(`   Enabled: ${this.isEnabled}`);
    console.log(`   Auth Key: ${this.authKey ? '✅ Set (' + this.authKey.substring(0, 8) + '...)' : '❌ Missing'}`);
    console.log(`   Integrated Number ID: ${this.integratedNumberId || '❌ Missing'}`);
    console.log(`   Namespace: ${this.namespace || '❌ Missing'}`);
    console.log(`   Admin Phone: ${this.adminPhone || '❌ Not set'}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'not set'}`);
  }

  /**
   * Format phone number to include country code
   * @param {string} phone - Phone number (10-digit Indian or with country code)
   * @returns {string} - Phone number with 91 prefix
   */
  formatPhone(phone) {
    if (!phone) return null;
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it starts with +91 or 91 and is 12 digits, it already has country code
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned;
    }
    
    // If it's a 10-digit Indian number, add 91 prefix
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    
    // If it starts with +, remove it
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    return cleaned;
  }

  /**
   * Send WhatsApp message using MSG91 API
   * @param {string} phone - Recipient phone number
   * @param {string} templateName - MSG91 template name
   * @param {Object} variables - Template variables as key-value pairs
   * @returns {Promise<Object>} - API response
   */
  async sendWhatsAppMessage(phone, templateName, variables = {}) {
    console.log(`\n📱 WhatsApp: Attempting to send "${templateName}" to ${phone}`);
    
    const formattedPhone = this.formatPhone(phone);
    
    if (!formattedPhone) {
      console.warn(`⚠️ WhatsApp: Invalid/empty phone number provided: "${phone}", skipping message`);
      return { success: false, reason: 'invalid_phone' };
    }

    console.log(`📱 WhatsApp: Formatted phone: ${formattedPhone}`);

    // Development mode - log instead of sending
    if (this.isDevelopment && !this.isEnabled) {
      console.log(`\n📱 [DEV MODE] WhatsApp Message:`);
      console.log(`   To: ${formattedPhone}`);
      console.log(`   Template: ${templateName}`);
      console.log(`   Variables:`, JSON.stringify(variables, null, 2));
      console.log(`   (Set WHATSAPP_ENABLED=true in .env to send real messages)\n`);
      return { success: true, mode: 'development' };
    }

    if (!this.isEnabled) {
      console.log(`📱 WhatsApp disabled (WHATSAPP_ENABLED=${process.env.WHATSAPP_ENABLED}). Would send "${templateName}" to ${formattedPhone}`);
      return { success: false, reason: 'whatsapp_disabled' };
    }

    if (!this.authKey) {
      console.error('❌ MSG91_AUTH_KEY not configured in .env');
      return { success: false, reason: 'missing_auth_key' };
    }

    if (!this.integratedNumberId) {
      console.error('❌ MSG91_WHATSAPP_INTEGRATED_NUMBER_ID not configured in .env');
      return { success: false, reason: 'missing_integrated_number_id' };
    }

    try {
      const components = this._buildComponents(variables);
      
      const payload = {
        integrated_number: this.integratedNumberId,
        content_type: 'template',
        payload: {
          messaging_product: 'whatsapp',
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'en',
              policy: 'deterministic'
            },
            namespace: this.namespace,
            to_and_components: [
              {
                to: [formattedPhone],
                components: components
              }
            ]
          }
        }
      };

      console.log(`📱 WhatsApp: Sending API request to MSG91...`);
      console.log(`📱 WhatsApp: Payload:`, JSON.stringify(payload, null, 2));

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'authkey': this.authKey,
          'Content-Type': 'application/json'
        }
      });
      
      const msg91RequestId = response.data?.request_id || 'N/A';

      console.log(`✅ WhatsApp message sent to ${formattedPhone} (template: ${templateName})`);
      console.log(`✅ WhatsApp API Response:`, JSON.stringify(response.data, null, 2));
      console.log(`✅ MSG91 Request ID for log tracking: ${msg91RequestId}`);
      return {
        success: true,
        provider: 'MSG91',
        request_id: msg91RequestId,
        response: response.data
      };
    } catch (error) {
      console.error(`❌ WhatsApp Error (${templateName} to ${formattedPhone}):`);
      console.error(`❌ Status: ${error.response?.status}`);
      console.error(`❌ Response Data:`, JSON.stringify(error.response?.data, null, 2));
      console.error(`❌ Error Message:`, error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Build template components from variables
   * MSG91 expects components as an OBJECT with body_1, body_2, etc. keys
   * Each key has { type: "text", value: "..." }
   *
   * CRITICAL: We NEVER include header_1 keys for templates with static headers.
   * This prevents "Invalid Header Component" errors.
   *
   * @param {Object} variables - Key-value pairs of template variables
   * @returns {Object} - Components object for MSG91 API (e.g., {body_1: {type: "text", value: "..."}, body_2: {...}})
   */
  _buildComponents(variables) {
    if (!variables || Object.keys(variables).length === 0) {
      return {};
    }

    const components = {};

    // NEVER include header_1, header_2, etc. - causes "Invalid Header Component" error
    // MSG91 templates with static text headers don't need header keys in components

    // Body parameters (most common)
    let bodyArray = [];
    if (variables.body) {
      bodyArray = Array.isArray(variables.body)
        ? variables.body
        : Object.values(variables.body);
    } else {
      // If no explicit body key, treat all non-header/button variables as body parameters
      bodyArray = Object.entries(variables)
        .filter(([key]) => key !== 'header' && key !== 'buttons')
        .map(([, val]) => val);
    }

    // Add body_1, body_2, body_3, etc. with MSG91 format
    bodyArray.forEach((val, index) => {
      components[`body_${index + 1}`] = {
        type: 'text',
        value: String(val)
      };
    });

    // Button parameters (if provided)
    if (variables.buttons && Array.isArray(variables.buttons)) {
      variables.buttons.forEach((button, index) => {
        components[`button_${index + 1}`] = {
          type: 'text',
          value: String(button.text || button)
        };
      });
    }

    return components;
  }

  /**
   * Send message to multiple recipients with the same template
   * @param {Array<string>} phones - Array of phone numbers
   * @param {string} templateName - MSG91 template name
   * @param {Object} variables - Template variables
   * @returns {Promise<Array>} - Array of results
   */
  async sendBulkWhatsApp(phones, templateName, variables = {}) {
    const results = [];
    for (const phone of phones) {
      try {
        const result = await this.sendWhatsAppMessage(phone, templateName, variables);
        results.push({ phone, ...result });
      } catch (error) {
        results.push({ phone, success: false, error: error.message });
      }
    }
    return results;
  }

  // ============================================================
  // NEW USER SIGNUP NOTIFICATIONS
  // ============================================================

  /**
   * Send WhatsApp notification to admin when a new user signs up
   * @param {Object} userData - New user data
   */
  async sendNewUserSignupToAdmin(userData) {
    if (!this.adminPhone) {
      console.log('⚠️ ADMIN_WHATSAPP_NUMBER not set, skipping admin WhatsApp notification');
      return;
    }

    const { name, email, phone, role } = userData;
    const roleLabel = this._getRoleLabel(role);

    return this.sendWhatsAppMessage(this.adminPhone, 'new_user_signup', {
      body: [
        name || 'N/A',
        email || 'N/A',
        phone || 'N/A',
        roleLabel,
        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      ]
    });
  }

  /**
   * Send WhatsApp notification to admin when a new professional signs up
   * @param {Object} professionalData - New professional data
   */
  async sendNewProfessionalSignupToAdmin(professionalData) {
    if (!this.adminPhone) {
      console.log('⚠️ ADMIN_WHATSAPP_NUMBER not set, skipping admin WhatsApp notification');
      return;
    }

    const { name, email, phone, professionalType, specialization, experience, barRegistrationNo, registrationNo } = professionalData;
    const roleLabel = this._getRoleLabel(professionalType);
    const regNo = barRegistrationNo || registrationNo || 'N/A';

    return this.sendWhatsAppMessage(this.adminPhone, 'new_professional_signup', {
      body: [
        name || 'N/A',
        roleLabel,
        email || 'N/A',
        phone || 'N/A',
        regNo,
        Array.isArray(specialization) ? specialization.join(', ') : (specialization || 'N/A'),
        experience ? `${experience} years` : 'N/A',
        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      ]
    });
  }

  /**
   * Send welcome WhatsApp message to newly registered user
   * @param {Object} userData - User data
   */
  async sendWelcomeToUser(userData) {
    const { name, phone } = userData;
    if (!phone) return;

    return this.sendWhatsAppMessage(phone, 'welcome_user', {
      body: [
        name || 'User'
      ]
    });
  }

  /**
   * Send welcome WhatsApp message to newly registered professional
   * @param {Object} professionalData - Professional data
   */
  async sendWelcomeToProfessional(professionalData) {
    const { name, phone, professionalType } = professionalData;
    if (!phone) return;

    const roleLabel = this._getRoleLabel(professionalType);

    return this.sendWhatsAppMessage(phone, 'welcome_professional', {
      body: [
        name || 'Professional',
        roleLabel
      ]
    });
  }

  // ============================================================
  // CONSULTATION BOOKING NOTIFICATIONS
  // ============================================================

  /**
   * Send WhatsApp notification to client when consultation is booked (in-person)
   * @param {Object} consultationData - Consultation details
   */
  async sendConsultationBookedToClient(consultationData) {
    console.log('📱 WhatsApp: sendConsultationBookedToClient called with:', JSON.stringify(consultationData, null, 2));
    const { clientPhone, clientName, lawyerName, caseType, preferredDate, preferredTime } = consultationData;
    if (!clientPhone) {
      console.warn('⚠️ WhatsApp: No client phone number provided, skipping consultation booked notification to client');
      return { success: false, reason: 'no_client_phone' };
    }

    const formattedDate = this._formatDate(preferredDate);

    return this.sendWhatsAppMessage(clientPhone, 'consultation_booked_client', {
      body: [
        clientName || 'Client',
        lawyerName || 'Professional',
        caseType || 'General',
        formattedDate,
        preferredTime || 'TBD'
      ]
    });
  }

  /**
   * Send WhatsApp notification to professional when consultation is booked
   * @param {Object} consultationData - Consultation details
   */
  async sendConsultationBookedToProfessional(consultationData) {
    console.log('📱 WhatsApp: sendConsultationBookedToProfessional called');
    const { professionalPhone, clientName, lawyerName, caseType, preferredDate, preferredTime, consultationType } = consultationData;
    if (!professionalPhone) {
      console.warn('⚠️ WhatsApp: No professional phone number provided, skipping consultation booked notification to professional');
      return { success: false, reason: 'no_professional_phone' };
    }

    const formattedDate = this._formatDate(preferredDate);
    const type = consultationType === 'video' ? 'Video' : 'In-Person';

    return this.sendWhatsAppMessage(professionalPhone, 'consultation_booked_professional', {
      // Don't include header - let MSG91 use the template's default header
      body: [
        lawyerName || 'Professional',
        clientName || 'Client',
        type,
        caseType || 'General',
        formattedDate,
        preferredTime || 'TBD'
      ]
    });
  }

  /**
   * Send WhatsApp notification to admin when consultation is booked
   * @param {Object} consultationData - Consultation details
   */
  async sendConsultationBookedToAdmin(consultationData) {
    console.log('📱 WhatsApp: sendConsultationBookedToAdmin called');
    if (!this.adminPhone) {
      console.warn('⚠️ WhatsApp: No admin phone number configured, skipping admin notification');
      return { success: false, reason: 'no_admin_phone' };
    }

    const { clientName, lawyerName, caseType, preferredDate, preferredTime, consultationType, amount } = consultationData;
    const formattedDate = this._formatDate(preferredDate);
    const type = consultationType === 'video' ? 'Video' : 'In-Person';

    return this.sendWhatsAppMessage(this.adminPhone, 'consultation_booked_admin', {
      body: [
        clientName || 'Client',
        lawyerName || 'Professional',
        type,
        caseType || 'General',
        formattedDate,
        preferredTime || 'TBD',
        amount ? `₹${amount}` : 'N/A'
      ]
    });
  }

  /**
   * Send WhatsApp notification to client for video consultation booking
   * @param {Object} consultationData - Consultation details
   */
  async sendVideoConsultationBookedToClient(consultationData) {
    console.log('📱 WhatsApp: sendVideoConsultationBookedToClient called');
    const { clientPhone, clientName, lawyerName, preferredDate, preferredTime, amount } = consultationData;
    if (!clientPhone) {
      console.warn('⚠️ WhatsApp: No client phone for video consultation notification');
      return { success: false, reason: 'no_client_phone' };
    }

    const formattedDate = this._formatDate(preferredDate);

    return this.sendWhatsAppMessage(clientPhone, 'video_consultation_booked_client', {
      body: [
        clientName || 'Client',
        lawyerName || 'Professional',
        formattedDate,
        preferredTime || 'TBD',
        amount ? `₹${amount}` : 'N/A'
      ]
    });
  }

  /**
   * Send WhatsApp notification to professional for video consultation booking
   * @param {Object} consultationData - Consultation details
   */
  async sendVideoConsultationBookedToProfessional(consultationData) {
    console.log('📱 WhatsApp: sendVideoConsultationBookedToProfessional called');
    const { professionalPhone, clientName, lawyerName, preferredDate, preferredTime, amount } = consultationData;
    if (!professionalPhone) {
      console.warn('⚠️ WhatsApp: No professional phone for video consultation notification');
      return { success: false, reason: 'no_professional_phone' };
    }

    const formattedDate = this._formatDate(preferredDate);

    return this.sendWhatsAppMessage(professionalPhone, 'video_consultation_booked_professional', {
      body: [
        lawyerName || 'Professional',
        clientName || 'Client',
        formattedDate,
        preferredTime || 'TBD',
        amount ? `₹${amount}` : 'N/A'
      ]
    });
  }

  // ============================================================
  // APPOINTMENT STATUS UPDATE NOTIFICATIONS
  // ============================================================

  /**
   * Send WhatsApp notification when appointment is accepted
   * @param {Object} data - Appointment data
   */
  async sendAppointmentAccepted(data) {
    console.log('📱 WhatsApp: sendAppointmentAccepted called with:', JSON.stringify(data, null, 2));
    const { clientPhone, professionalPhone, clientName, lawyerName, preferredDate, preferredTime, consultationType } = data;
    const formattedDate = this._formatDate(preferredDate);
    const type = consultationType === 'video' ? 'Video' : 'In-Person';

    const promises = [];

    // Notify client
    if (clientPhone) {
      promises.push(
        this.sendWhatsAppMessage(clientPhone, 'appointment_accepted_client', {
          body: [
            clientName || 'Client',
            lawyerName || 'Professional',
            type,
            formattedDate,
            preferredTime || 'TBD'
          ]
        })
      );
    }

    // Notify professional (confirmation)
    if (professionalPhone) {
      promises.push(
        this.sendWhatsAppMessage(professionalPhone, 'appointment_accepted_professional', {
          body: [
            lawyerName || 'Professional',
            clientName || 'Client',
            type,
            formattedDate,
            preferredTime || 'TBD'
          ]
        })
      );
    }

    // Notify admin
    if (this.adminPhone) {
      promises.push(
        this.sendWhatsAppMessage(this.adminPhone, 'appointment_status_admin', {
          body: [
            'Accepted',
            clientName || 'Client',
            lawyerName || 'Professional',
            type,
            formattedDate,
            preferredTime || 'TBD'
          ]
        })
      );
    }

    return Promise.allSettled(promises);
  }

  /**
   * Send WhatsApp notification when appointment is rescheduled
   * @param {Object} data - Appointment data with new date/time
   */
  async sendAppointmentRescheduled(data) {
    console.log('📱 WhatsApp: sendAppointmentRescheduled called with:', JSON.stringify(data, null, 2));
    const { clientPhone, professionalPhone, clientName, lawyerName, preferredDate, preferredTime, consultationType, reason } = data;
    const formattedDate = this._formatDate(preferredDate);
    const type = consultationType === 'video' ? 'Video' : 'In-Person';

    const promises = [];

    // Notify client
    if (clientPhone) {
      promises.push(
        this.sendWhatsAppMessage(clientPhone, 'appointment_rescheduled_client', {
          body: [
            clientName || 'Client',
            lawyerName || 'Professional',
            type,
            formattedDate,
            preferredTime || 'TBD',
            reason || 'Schedule adjustment'
          ]
        })
      );
    }

    // Notify professional (confirmation)
    if (professionalPhone) {
      promises.push(
        this.sendWhatsAppMessage(professionalPhone, 'appointment_rescheduled_professional', {
          body: [
            lawyerName || 'Professional',
            clientName || 'Client',
            type,
            formattedDate,
            preferredTime || 'TBD',
            reason || 'Schedule adjustment'
          ]
        })
      );
    }

    // Notify admin
    if (this.adminPhone) {
      promises.push(
        this.sendWhatsAppMessage(this.adminPhone, 'appointment_status_admin', {
          body: [
            'Rescheduled',
            clientName || 'Client',
            lawyerName || 'Professional',
            type,
            formattedDate,
            preferredTime || 'TBD'
          ]
        })
      );
    }

    return Promise.allSettled(promises);
  }

  /**
   * Send WhatsApp notification when appointment is cancelled
   * @param {Object} data - Appointment data
   */
  async sendAppointmentCancelled(data) {
    console.log('📱 WhatsApp: sendAppointmentCancelled called with:', JSON.stringify(data, null, 2));
    const { clientPhone, professionalPhone, clientName, lawyerName, preferredDate, preferredTime, consultationType, reason, cancelledBy } = data;
    const formattedDate = this._formatDate(preferredDate);
    const type = consultationType === 'video' ? 'Video' : 'In-Person';
    const cancelledByLabel = cancelledBy === 'professional' ? lawyerName : clientName;

    const promises = [];

    // Notify client
    if (clientPhone) {
      promises.push(
        this.sendWhatsAppMessage(clientPhone, 'appointment_cancelled_client', {
          body: [
            clientName || 'Client',
            lawyerName || 'Professional',
            type,
            formattedDate,
            preferredTime || 'TBD',
            reason || 'No reason provided'
          ]
        })
      );
    }

    // Notify professional
    if (professionalPhone) {
      promises.push(
        this.sendWhatsAppMessage(professionalPhone, 'appointment_cancelled_professional', {
          body: [
            lawyerName || 'Professional',
            clientName || 'Client',
            type,
            formattedDate,
            preferredTime || 'TBD',
            reason || 'No reason provided'
          ]
        })
      );
    }

    // Notify admin
    if (this.adminPhone) {
      promises.push(
        this.sendWhatsAppMessage(this.adminPhone, 'appointment_status_admin', {
          body: [
            `Cancelled by ${cancelledByLabel || 'User'}`,
            clientName || 'Client',
            lawyerName || 'Professional',
            type,
            formattedDate,
            preferredTime || 'TBD'
          ]
        })
      );
    }

    return Promise.allSettled(promises);
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  /**
   * Get human-readable role label
   * @param {string} role - Role identifier
   * @returns {string} - Human-readable label
   */
  _getRoleLabel(role) {
    const labels = {
      'user': 'Client',
      'client': 'Client',
      'lawyer': 'Lawyer/Advocate',
      'tax-consultant': 'Tax Consultant',
      'auditor': 'Auditor',
      'admin': 'Admin'
    };
    return labels[role] || role || 'User';
  }

  /**
   * Format date for display in WhatsApp messages
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted date string
   */
  _formatDate(date) {
    if (!date) return 'TBD';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    } catch {
      return String(date);
    }
  }
}

module.exports = new WhatsAppService();
