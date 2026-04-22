const Consultation = require('../models/Consultation');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const multer = require('multer');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Helper function to find or create lawyer in database
async function findOrCreateLawyer(lawyerData) {
  try {
    const { id, name, email, barRegistrationNo, specialization, experience, location, court, phone, address, languages, education, description } = lawyerData;
    
    // Try to find lawyer by ID first
    let lawyer = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      lawyer = await Lawyer.findById(id);
    }
    
    // If not found by ID, try to find by bar registration number or email
    if (!lawyer && (barRegistrationNo || email)) {
      const query = {};
      if (barRegistrationNo) query.barRegistrationNo = barRegistrationNo;
      if (email && !barRegistrationNo) query.email = email;
      
      lawyer = await Lawyer.findOne(query);
    }
    
    // If lawyer exists, update booking count and return
    if (lawyer) {
      lawyer.totalBookings = (lawyer.totalBookings || 0) + 1;
      lawyer.lastBookedAt = Date.now();
      await lawyer.save();
      console.log(`✓ Updated existing lawyer: ${lawyer.name} (ID: ${lawyer._id})`);
      return lawyer;
    }
    
    // Lawyer doesn't exist - create new record from web scraper data
    const newLawyer = await Lawyer.create({
      name: name || 'Unknown Lawyer',
      email: email || `lawyer_${Date.now()}@temp.com`,
      barRegistrationNo: barRegistrationNo || `TEMP/${Date.now()}`,
      specialization: Array.isArray(specialization) ? specialization : [specialization || 'General Practice'],
      experience: experience || 0,
      location: location || 'Unknown',
      court: court || 'District Court',
      phone: phone || '',
      address: address || '',
      languages: Array.isArray(languages) ? languages : ['English'],
      education: education || 'LLB',
      description: description || 'Legal professional',
      isVerified: false, // Mark as unverified since from web scraper
      totalBookings: 1,
      lastBookedAt: Date.now(),
      source: 'web_scraper' // Track where this lawyer came from
    });
    
    console.log(`✓ Created new lawyer from web scraper: ${newLawyer.name} (ID: ${newLawyer._id})`);
    return newLawyer;
  } catch (error) {
    console.error('Error in findOrCreateLawyer:', error);
    throw error;
  }
}

// Create a new consultation
exports.createConsultation = async (req, res) => {
  try {
    console.log('=== Create Consultation Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User from token:', req.user);
    
    const {
      lawyerId,
      lawyerName,
      lawyerEmail,
      lawyerData, // Full lawyer object from web scraper
      caseType,
      caseDescription,
      preferredDate,
      preferredTime,
      name,
      email,
      phone
    } = req.body;

    // Get authenticated user ID from request (set by auth middleware)
    if (!req.user || !req.user.id) {
      console.error('No authenticated user found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login to book a consultation.'
      });
    }

    const clientId = req.user.id;
    console.log('Client ID:', clientId);

    // Check if user is a lawyer - lawyers cannot book consultations
    const user = await User.findById(clientId);
    console.log('User found:', user ? `${user.name} (${user.role})` : 'Not found');
    
    if (user && user.role === 'lawyer') {
      return res.status(403).json({
        success: false,
        message: 'Lawyers cannot book consultations with other lawyers'
      });
    }

    // Find or create lawyer in database
    let lawyer;
    if (lawyerData) {
      console.log('Creating/finding lawyer with full data');
      // Full lawyer data provided - find or create
      lawyer = await findOrCreateLawyer({
        id: lawyerId,
        name: lawyerName,
        email: lawyerEmail,
        ...lawyerData
      });
    } else {
      console.log('Trying to find existing lawyer by ID:', lawyerId);
      // Try to find existing lawyer
      lawyer = await Lawyer.findById(lawyerId);
      
      // If not found and we have basic info, create minimal record
      if (!lawyer && lawyerName) {
        console.log('Lawyer not found, creating with basic info');
        lawyer = await findOrCreateLawyer({
          id: lawyerId,
          name: lawyerName,
          email: lawyerEmail
        });
      }
    }

    const actualLawyerId = lawyer ? lawyer._id : (mongoose.Types.ObjectId.isValid(lawyerId) ? lawyerId : new mongoose.Types.ObjectId());
    console.log('Actual lawyer ID to use:', actualLawyerId);

    // Create consultation
    const consultation = await Consultation.create({
      clientId,
      lawyerId: actualLawyerId,
      clientInfo: {
        name: name || req.user.name,
        email: email || req.user.email,
        phone: phone || req.user.phone
      },
      lawyerInfo: {
        name: lawyerName || (lawyer ? lawyer.name : 'Unknown'),
        email: lawyerEmail || (lawyer ? lawyer.email : ''),
        specialization: lawyer ? lawyer.specialization : []
      },
      caseType,
      caseDescription,
      preferredDate,
      preferredTime,
      status: 'pending'
    });

    console.log('Consultation created successfully:', consultation._id);

    // Send notification email to admin (non-blocking)
    emailService.sendNewConsultationNotification({
      clientName: consultation.clientInfo.name,
      clientEmail: consultation.clientInfo.email,
      clientPhone: consultation.clientInfo.phone,
      lawyerName: consultation.lawyerInfo.name,
      lawyerEmail: consultation.lawyerInfo.email,
      caseType: consultation.caseType,
      caseDescription: consultation.caseDescription,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      consultationType: 'in-person'
    }).catch(err => console.error('Failed to send consultation notification:', err));

    // Send WhatsApp notifications for in-person consultation booking (non-blocking)
    const professionalPhone = lawyer ? lawyer.phone : null;
    const whatsappData = {
      clientPhone: consultation.clientInfo.phone,
      clientName: consultation.clientInfo.name,
      professionalPhone: professionalPhone,
      lawyerName: consultation.lawyerInfo.name,
      caseType: consultation.caseType,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      consultationType: 'in-person'
    };

    console.log('📱 WhatsApp notification data for in-person consultation:', JSON.stringify(whatsappData, null, 2));
    console.log('📱 Client phone from consultation:', consultation.clientInfo.phone);
    console.log('📱 Professional phone from lawyer record:', professionalPhone);

    // Notify client
    whatsappService.sendConsultationBookedToClient(whatsappData)
      .then(result => console.log('📱 WhatsApp client notification result:', JSON.stringify(result)))
      .catch(err => console.error('Failed to send WhatsApp consultation booked to client:', err));

    // Notify professional
    whatsappService.sendConsultationBookedToProfessional(whatsappData)
      .then(result => console.log('📱 WhatsApp professional notification result:', JSON.stringify(result)))
      .catch(err => console.error('Failed to send WhatsApp consultation booked to professional:', err));

    // Notify admin
    whatsappService.sendConsultationBookedToAdmin(whatsappData)
      .then(result => console.log('📱 WhatsApp admin notification result:', JSON.stringify(result)))
      .catch(err => console.error('Failed to send WhatsApp consultation booked to admin:', err));

    console.log('=== End Create Consultation ===');

    res.status(201).json({
      success: true,
      message: 'Consultation booked successfully',
      consultation: consultation.getSummary(),
      lawyerSaved: !!lawyer // Indicate if lawyer was saved to database
    });
  } catch (error) {
    console.error('=== Create consultation error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== End Error ===');
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to book consultation',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all consultations for authenticated user
exports.getUserConsultations = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const userId = req.user.id;
    const user = await User.findById(userId);

    console.log('=== getUserConsultations Debug ===');
    console.log('User ID:', userId);
    console.log('User:', user);
    console.log('User Role:', user?.role);

    let consultations;

    // If user is a lawyer, fetch consultations where they are the lawyer
    if (user && user.role === 'lawyer') {
      console.log('User is a LAWYER - fetching consultations where they are the lawyer');
      // Find lawyer record
      const lawyer = await Lawyer.findOne({ userId: userId });
      console.log('Lawyer record:', lawyer);
      
      if (lawyer) {
        // Fetch consultations where this user is the lawyer
        const query = { lawyerId: lawyer._id };
        if (status) query.status = status;

        consultations = await Consultation.find(query)
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .lean();
        console.log('Found consultations for lawyer:', consultations.length);
      } else {
        consultations = [];
        console.log('No lawyer record found');
      }
    } else {
      console.log('User is a CLIENT - fetching consultations where they are the client');
      // Regular user - fetch consultations where they are the client
      consultations = await Consultation.getByClient(userId, {
        status,
        limit: parseInt(limit)
      });
      console.log('Found consultations for client:', consultations.length);
    }

    console.log('=== End Debug ===');

    res.status(200).json({
      success: true,
      consultations,
      total: consultations.length
    });
  } catch (error) {
    console.error('Get user consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultations'
    });
  }
};

// Get consultation by ID
exports.getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const consultation = await Consultation.findById(id)
      .populate('lawyerId', 'name email phone specialization rating')
      .populate('clientId', 'name email phone');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is authorized to view this consultation
    if (consultation.clientId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this consultation'
      });
    }

    res.status(200).json({
      success: true,
      consultation
    });
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultation'
    });
  }
};

// Update consultation status
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, videoCallData, notes } = req.body;
    const userId = req.user.id;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is authorized
    if (consultation.clientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this consultation'
      });
    }

    // Update fields
    if (status) consultation.status = status;
    if (videoCallData) consultation.videoCallData = videoCallData;
    if (notes) consultation.notes = notes;

    await consultation.save();

    res.status(200).json({
      success: true,
      message: 'Consultation updated successfully',
      consultation: consultation.getSummary()
    });
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consultation'
    });
  }
};

// Cancel consultation
exports.cancelConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is authorized
    if (consultation.clientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this consultation'
      });
    }

    // Check if consultation can be cancelled
    if (consultation.status === 'completed' || consultation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${consultation.status} consultation`
      });
    }

    consultation.status = 'cancelled';
    consultation.cancelledAt = Date.now();
    await consultation.save();

    // Send WhatsApp notifications for client-initiated cancellation (non-blocking)
    let cancelledLawyer = null;
    try {
      cancelledLawyer = await Lawyer.findById(consultation.lawyerId);
    } catch (e) {
      console.error('Failed to find lawyer for WhatsApp cancellation notification:', e);
    }

    whatsappService.sendAppointmentCancelled({
      clientPhone: consultation.clientInfo.phone,
      professionalPhone: cancelledLawyer ? cancelledLawyer.phone : null,
      clientName: consultation.clientInfo.name,
      lawyerName: consultation.lawyerInfo.name,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      consultationType: consultation.consultationType || 'in-person',
      reason: 'Cancelled by client',
      cancelledBy: 'client'
    }).catch(err => console.error('Failed to send WhatsApp cancellation notifications:', err));

    res.status(200).json({
      success: true,
      message: 'Consultation cancelled successfully',
      consultation: consultation.getSummary()
    });
  } catch (error) {
    console.error('Cancel consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel consultation'
    });
  }
};

// Add rating and review
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is authorized
    if (consultation.clientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this consultation'
      });
    }

    // Check if consultation is completed
    if (consultation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed consultations'
      });
    }

    // Check if already reviewed
    if (consultation.rating) {
      return res.status(400).json({
        success: false,
        message: 'Consultation already reviewed'
      });
    }

    consultation.rating = rating;
    consultation.review = review;
    consultation.reviewedAt = Date.now();
    await consultation.save();

    // Update lawyer's average rating
    const lawyer = await Lawyer.findById(consultation.lawyerId);
    if (lawyer) {
      const consultations = await Consultation.find({
        lawyerId: lawyer._id,
        rating: { $exists: true }
      });
      
      const totalRating = consultations.reduce((sum, c) => sum + c.rating, 0);
      lawyer.rating = totalRating / consultations.length;
      lawyer.totalReviews = consultations.length;
      await lawyer.save();
    }

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      consultation: consultation.getSummary()
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
};

// Get consultation statistics for user
exports.getConsultationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Consultation.aggregate([
      { $match: { clientId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Consultation.countDocuments({ clientId: userId });

    res.status(200).json({
      success: true,
      stats: {
        total,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Create Razorpay order for video consultation
exports.createRazorpayOrder = async (req, res) => {
  try {
    const {
      amount,
      lawyerId,
      lawyerName,
      lawyerEmail,
      lawyerData, // Full lawyer object from web scraper
      consultationDate,
      consultationTime,
      caseDescription
    } = req.body;

    const clientId = req.user.id;

    // Check if user is a lawyer - lawyers cannot book consultations
    const user = await User.findById(clientId);
    if (user && user.role === 'lawyer') {
      return res.status(403).json({
        success: false,
        message: 'Lawyers cannot book consultations with other lawyers'
      });
    }

    // *** FIX: Only cancel EXPIRED pending_payment consultations (past date) ***
    // Keep valid pending payments so user can complete them from Appointments page
    const pendingPayments = await Consultation.find({
      clientId,
      status: 'pending_payment',
      paymentStatus: 'pending'
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    if (pendingPayments.length > 0) {
      console.log(`Found ${pendingPayments.length} pending payment consultation(s) for user ${clientId}`);
      for (const pending of pendingPayments) {
        const consultDate = new Date(pending.preferredDate);
        consultDate.setHours(0, 0, 0, 0);
        
        if (consultDate < now) {
          // Consultation date has passed - auto-cancel
          pending.status = 'cancelled';
          pending.paymentStatus = 'failed';
          pending.cancelledAt = Date.now();
          pending.notes = 'Auto-cancelled: Consultation date has passed without payment';
          await pending.save();
          console.log(`  ✓ Auto-cancelled expired pending consultation: ${pending._id} (date: ${pending.preferredDate})`);
        } else {
          console.log(`  ℹ Keeping valid pending consultation: ${pending._id} (date: ${pending.preferredDate})`);
        }
      }
    }

    // Find or create lawyer in database
    let lawyer;
    if (lawyerData) {
      // Full lawyer data provided - find or create
      lawyer = await findOrCreateLawyer({
        id: lawyerId,
        name: lawyerName,
        email: lawyerEmail,
        ...lawyerData
      });
    } else {
      // Try to find existing lawyer
      if (mongoose.Types.ObjectId.isValid(lawyerId)) {
        lawyer = await Lawyer.findById(lawyerId);
      }
      
      // If not found and we have basic info, create minimal record
      if (!lawyer && lawyerName) {
        lawyer = await findOrCreateLawyer({
          id: lawyerId,
          name: lawyerName,
          email: lawyerEmail
        });
      }
    }

    const actualLawyerId = lawyer ? lawyer._id : (mongoose.Types.ObjectId.isValid(lawyerId) ? lawyerId : new mongoose.Types.ObjectId());

    // Create consultation first with pending payment status
    const consultation = await Consultation.create({
      clientId,
      lawyerId: actualLawyerId,
      clientInfo: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || req.user.mobile || '0000000000' // Fallback if phone not available
      },
      lawyerInfo: {
        name: lawyerName || (lawyer ? lawyer.name : 'Unknown'),
        email: lawyerEmail || (lawyer ? lawyer.email : ''),
        specialization: lawyer ? lawyer.specialization : []
      },
      caseType: 'Video Consultation',
      caseDescription,
      preferredDate: consultationDate,
      preferredTime: consultationTime,
      status: 'pending_payment',
      consultationType: 'video',
      paymentStatus: 'pending',
      amount: amount
    });

    // Create Razorpay order
    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `consultation_${consultation._id}`,
      notes: {
        consultationId: consultation._id.toString(),
        clientId: clientId,
        lawyerId: actualLawyerId.toString(),
        lawyerName: lawyerName
      }
    };

    const order = await razorpay.orders.create(options);

    // Update consultation with order ID
    consultation.razorpayOrderId = order.id;
    await consultation.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      consultationId: consultation._id,
      lawyerSaved: !!lawyer // Indicate if lawyer was saved to database
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      consultationId
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update consultation with payment details
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    consultation.status = 'confirmed';
    consultation.paymentStatus = 'paid';
    consultation.razorpayPaymentId = razorpay_payment_id;
    consultation.razorpaySignature = razorpay_signature;
    consultation.paidAt = Date.now();
    await consultation.save();

    // Send notification email to admin for paid video consultation (non-blocking)
    emailService.sendNewConsultationNotification({
      clientName: consultation.clientInfo.name,
      clientEmail: consultation.clientInfo.email,
      clientPhone: consultation.clientInfo.phone,
      lawyerName: consultation.lawyerInfo.name,
      lawyerEmail: consultation.lawyerInfo.email,
      caseType: consultation.caseType,
      caseDescription: consultation.caseDescription,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      consultationType: 'video',
      amount: consultation.amount
    }).catch(err => console.error('Failed to send video consultation notification:', err));

    // Send WhatsApp notifications for video consultation payment confirmed (non-blocking)
    // Look up the lawyer to get their phone number
    let videoLawyer = null;
    try {
      videoLawyer = await Lawyer.findById(consultation.lawyerId);
    } catch (e) {
      console.error('Failed to find lawyer for WhatsApp notification:', e);
    }

    const videoWhatsappData = {
      clientPhone: consultation.clientInfo.phone,
      clientName: consultation.clientInfo.name,
      professionalPhone: videoLawyer ? videoLawyer.phone : null,
      lawyerName: consultation.lawyerInfo.name,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      consultationType: 'video',
      amount: consultation.amount
    };

    // Notify client about video consultation booking
    whatsappService.sendVideoConsultationBookedToClient(videoWhatsappData)
      .catch(err => console.error('Failed to send WhatsApp video consultation to client:', err));

    // Notify professional about video consultation booking
    whatsappService.sendVideoConsultationBookedToProfessional(videoWhatsappData)
      .catch(err => console.error('Failed to send WhatsApp video consultation to professional:', err));

    // Notify admin about video consultation booking
    whatsappService.sendConsultationBookedToAdmin({
      ...videoWhatsappData,
      caseType: consultation.caseType
    }).catch(err => console.error('Failed to send WhatsApp video consultation to admin:', err));

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      consultation: consultation.getSummary()
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
};

// Cancel pending payment consultation (when user dismisses Razorpay modal)
exports.cancelPendingPayment = async (req, res) => {
  try {
    const { consultationId } = req.body;
    const clientId = req.user.id;

    if (consultationId) {
      // Cancel specific consultation
      const consultation = await Consultation.findById(consultationId);
      if (consultation && consultation.clientId.toString() === clientId && consultation.status === 'pending_payment') {
        consultation.status = 'cancelled';
        consultation.paymentStatus = 'failed';
        consultation.cancelledAt = Date.now();
        consultation.notes = 'Payment dismissed by user';
        await consultation.save();
        console.log(`✓ Cancelled pending payment consultation: ${consultationId}`);
      }
    } else {
      // Cancel all pending payment consultations for this user
      const result = await Consultation.updateMany(
        { clientId, status: 'pending_payment', paymentStatus: 'pending' },
        { 
          $set: { 
            status: 'cancelled', 
            paymentStatus: 'failed', 
            cancelledAt: Date.now(),
            notes: 'Payment dismissed by user'
          } 
        }
      );
      console.log(`✓ Cancelled ${result.modifiedCount} pending payment consultation(s) for user ${clientId}`);
    }

    res.status(200).json({
      success: true,
      message: 'Pending payment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel pending payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel pending payment'
    });
  }
};

// Retry payment for an existing pending_payment consultation
exports.retryPayment = async (req, res) => {
  try {
    const { consultationId } = req.body;
    const clientId = req.user.id;

    if (!consultationId) {
      return res.status(400).json({
        success: false,
        message: 'Consultation ID is required'
      });
    }

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Verify the user owns this consultation
    if (consultation.clientId.toString() !== clientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this consultation'
      });
    }

    // Check consultation is in pending_payment status
    if (consultation.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: `Cannot retry payment for consultation with status: ${consultation.status}`
      });
    }

    // Check consultation date is not in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const consultDate = new Date(consultation.preferredDate);
    consultDate.setHours(0, 0, 0, 0);

    if (consultDate < now) {
      // Auto-cancel expired consultation
      consultation.status = 'cancelled';
      consultation.paymentStatus = 'failed';
      consultation.cancelledAt = Date.now();
      consultation.notes = 'Auto-cancelled: Consultation date has passed without payment';
      await consultation.save();

      return res.status(400).json({
        success: false,
        message: 'Cannot complete payment - consultation date has already passed. Please book a new consultation.'
      });
    }

    const amount = consultation.amount || 500; // Default fee if not set

    // Create a new Razorpay order for the existing consultation
    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `retry_${consultation._id}`,
      notes: {
        consultationId: consultation._id.toString(),
        clientId: clientId,
        lawyerId: consultation.lawyerId.toString(),
        retry: 'true'
      }
    };

    const order = await razorpay.orders.create(options);

    // Update consultation with new order ID
    consultation.razorpayOrderId = order.id;
    await consultation.save();

    console.log(`✓ Created retry payment order for consultation: ${consultation._id}, order: ${order.id}`);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      consultationId: consultation._id,
      lawyerName: consultation.lawyerInfo?.name || 'Lawyer'
    });
  } catch (error) {
    console.error('Retry payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create retry payment order'
    });
  }
};

// Lawyer accepts consultation
exports.acceptConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the lawyer record for this user
    const lawyer = await Lawyer.findOne({ userId: userId });
    
    if (!lawyer) {
      return res.status(403).json({
        success: false,
        message: 'Only lawyers can accept consultations'
      });
    }

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if this lawyer owns this consultation
    if (consultation.lawyerId.toString() !== lawyer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this consultation'
      });
    }

    // Check if consultation is in pending status
    if (consultation.status !== 'pending' && consultation.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept consultation with status: ${consultation.status}`
      });
    }

    consultation.status = 'confirmed';
    consultation.confirmedAt = Date.now();
    await consultation.save();

    // Send WhatsApp notifications for appointment accepted (non-blocking)
    let acceptedClient = null;
    try {
      acceptedClient = await User.findById(consultation.clientId);
    } catch (e) {
      console.error('Failed to find client for WhatsApp notification:', e);
    }

    whatsappService.sendAppointmentAccepted({
      clientPhone: acceptedClient ? acceptedClient.phone : consultation.clientInfo.phone,
      professionalPhone: lawyer.phone,
      clientName: consultation.clientInfo.name,
      lawyerName: consultation.lawyerInfo.name,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      consultationType: consultation.consultationType || 'in-person'
    }).catch(err => console.error('Failed to send WhatsApp appointment accepted notifications:', err));

    res.status(200).json({
      success: true,
      message: 'Consultation accepted successfully',
      consultation: consultation.getSummary()
    });
  } catch (error) {
    console.error('Accept consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept consultation'
    });
  }
};

// Lawyer rejects consultation
exports.rejectConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Find the lawyer record for this user
    const lawyer = await Lawyer.findOne({ userId: userId });
    
    if (!lawyer) {
      return res.status(403).json({
        success: false,
        message: 'Only lawyers can reject consultations'
      });
    }

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if this lawyer owns this consultation
    if (consultation.lawyerId.toString() !== lawyer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this consultation'
      });
    }

    // Check if consultation can be rejected
    if (consultation.status === 'completed' || consultation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a ${consultation.status} consultation`
      });
    }

    consultation.status = 'cancelled';
    consultation.cancelledAt = Date.now();
    consultation.lawyerNotes = reason || 'Rejected by lawyer';
    await consultation.save();

    // Send WhatsApp notifications for appointment cancelled/rejected by professional (non-blocking)
    let rejectedClient = null;
    try {
      rejectedClient = await User.findById(consultation.clientId);
    } catch (e) {
      console.error('Failed to find client for WhatsApp notification:', e);
    }

    whatsappService.sendAppointmentCancelled({
      clientPhone: rejectedClient ? rejectedClient.phone : consultation.clientInfo.phone,
      professionalPhone: lawyer.phone,
      clientName: consultation.clientInfo.name,
      lawyerName: consultation.lawyerInfo.name,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      consultationType: consultation.consultationType || 'in-person',
      reason: reason || 'Rejected by professional',
      cancelledBy: 'professional'
    }).catch(err => console.error('Failed to send WhatsApp appointment rejected notifications:', err));

    res.status(200).json({
      success: true,
      message: 'Consultation rejected successfully',
      consultation: consultation.getSummary()
    });
  } catch (error) {
    console.error('Reject consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject consultation'
    });
  }
};

// Lawyer reschedules consultation (edit date/time)
exports.rescheduleConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferredDate, preferredTime, reason } = req.body;
    const userId = req.user.id;

    // Find the lawyer record for this user
    const lawyer = await Lawyer.findOne({ userId: userId });
    
    if (!lawyer) {
      return res.status(403).json({
        success: false,
        message: 'Only lawyers can reschedule consultations'
      });
    }

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if this lawyer owns this consultation
    if (consultation.lawyerId.toString() !== lawyer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this consultation'
      });
    }

    // Check if consultation can be rescheduled
    if (consultation.status === 'completed' || consultation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${consultation.status} consultation`
      });
    }

    // Validate new date and time
    if (!preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'Both date and time are required for rescheduling'
      });
    }

    // Update consultation
    consultation.preferredDate = preferredDate;
    consultation.preferredTime = preferredTime;
    consultation.status = 'rescheduled';
    consultation.lawyerNotes = reason || 'Rescheduled by lawyer';
    await consultation.save();

    // Send WhatsApp notifications for appointment rescheduled (non-blocking)
    let rescheduledClient = null;
    try {
      rescheduledClient = await User.findById(consultation.clientId);
    } catch (e) {
      console.error('Failed to find client for WhatsApp notification:', e);
    }

    whatsappService.sendAppointmentRescheduled({
      clientPhone: rescheduledClient ? rescheduledClient.phone : consultation.clientInfo.phone,
      professionalPhone: lawyer.phone,
      clientName: consultation.clientInfo.name,
      lawyerName: consultation.lawyerInfo.name,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      consultationType: consultation.consultationType || 'in-person',
      reason: reason || 'Rescheduled by professional'
    }).catch(err => console.error('Failed to send WhatsApp appointment rescheduled notifications:', err));

    res.status(200).json({
      success: true,
      message: 'Consultation rescheduled successfully',
      consultation: consultation.getSummary()
    });
  } catch (error) {
    console.error('Reschedule consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule consultation'
    });
  }
};

// Configure multer for memory storage (base64 encoding)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow common document types
  const allowedMimetypes = [
    // PDF
    'application/pdf',
    // Word documents
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    // Excel spreadsheets
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    // PowerPoint presentations
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    // Text files
    'text/plain', // .txt
    'text/csv', // .csv
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    // Other common formats
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed'
  ];

  if (allowedMimetypes.includes(file.mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('File type not supported. Allowed: PDF, Word, Excel, PowerPoint, Text, Images, ZIP, RAR'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max (will be checked against user-specific limit)
  },
  fileFilter: fileFilter
});

// Middleware for handling file upload
exports.uploadDocument = upload.single('document');

// Upload document to consultation (stored as base64 in database)
exports.addDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is authorized (either client or lawyer)
    const user = await User.findById(userId);
    
    // Check if document upload feature is enabled for this user
    if (user.features && user.features.documentUpload === false) {
      return res.status(403).json({
        success: false,
        message: 'Document upload feature is disabled for your account. Please contact support.'
      });
    }

    const lawyer = user && (user.role === 'lawyer' || user.role === 'tax-consultant' || user.role === 'auditor')
      ? await Lawyer.findOne({ userId: userId })
      : null;
    
    const isClient = consultation.clientId.toString() === userId;
    const isProfessional = lawyer && consultation.lawyerId.toString() === lawyer._id.toString();

    if (!isClient && !isProfessional) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents to this consultation'
      });
    }

    // Get user's storage limits from database
    const userMaxFileSize = user.storageLimit?.maxFileSize || (5 * 1024 * 1024);
    const userMaxConsultationStorage = user.storageLimit?.maxConsultationStorage || (50 * 1024 * 1024);
    const userMaxTotalStorage = user.storageLimit?.maxTotalStorage || (500 * 1024 * 1024);

    // Check file size limit against user's limit
    if (req.file.size > userMaxFileSize) {
      const maxFileSizeMB = (userMaxFileSize / (1024 * 1024)).toFixed(2);
      return res.status(400).json({
        success: false,
        message: `File size exceeds your ${maxFileSizeMB}MB per file limit`
      });
    }

    // Calculate total storage used by this consultation
    const currentConsultationStorage = consultation.documents.reduce((total, doc) => total + doc.size, 0);
    const newConsultationStorage = currentConsultationStorage + req.file.size;

    if (newConsultationStorage > userMaxConsultationStorage) {
      const remainingSpace = userMaxConsultationStorage - currentConsultationStorage;
      const remainingMB = (remainingSpace / (1024 * 1024)).toFixed(2);
      const maxMB = (userMaxConsultationStorage / (1024 * 1024)).toFixed(2);
      return res.status(400).json({
        success: false,
        message: `Consultation storage limit exceeded. This consultation has ${remainingMB}MB remaining of ${maxMB}MB total storage.`,
        currentStorage: currentConsultationStorage,
        maxStorage: userMaxConsultationStorage,
        remainingStorage: remainingSpace
      });
    }

    // Calculate total storage used across all user's consultations
    const allUserConsultations = await Consultation.find({ clientId: userId });
    const totalUserStorage = allUserConsultations.reduce((total, cons) => {
      return total + cons.documents.reduce((docTotal, doc) => docTotal + doc.size, 0);
    }, 0);
    const newTotalUserStorage = totalUserStorage + req.file.size;

    if (newTotalUserStorage > userMaxTotalStorage) {
      const remainingSpace = userMaxTotalStorage - totalUserStorage;
      const remainingMB = (remainingSpace / (1024 * 1024)).toFixed(2);
      const maxMB = (userMaxTotalStorage / (1024 * 1024)).toFixed(2);
      return res.status(400).json({
        success: false,
        message: `Total storage limit exceeded. You have ${remainingMB}MB remaining of ${maxMB}MB total storage across all consultations.`,
        currentTotalStorage: totalUserStorage,
        maxTotalStorage: userMaxTotalStorage,
        remainingTotalStorage: remainingSpace
      });
    }

    // Convert file buffer to base64
    const base64Data = req.file.buffer.toString('base64');

    // Add document to consultation
    const document = {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: isProfessional ? 'professional' : 'client',
      uploadedAt: Date.now(),
      data: base64Data,
      visibleTo: 'both',
      isHidden: false
    };

    consultation.documents.push(document);
    await consultation.save();

    // Return document without base64 data (too large for response)
    const documentResponse = {
      _id: consultation.documents[consultation.documents.length - 1]._id,
      originalName: document.originalName,
      mimetype: document.mimetype,
      size: document.size,
      uploadedBy: document.uploadedBy,
      uploadedAt: document.uploadedAt
    };

    // Calculate updated storage info
    const updatedConsultationStorage = currentConsultationStorage + req.file.size;
    const remainingConsultationStorage = userMaxConsultationStorage - updatedConsultationStorage;
    const updatedTotalStorage = totalUserStorage + req.file.size;
    const remainingTotalStorage = userMaxTotalStorage - updatedTotalStorage;

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      document: documentResponse,
      storageInfo: {
        consultation: {
          used: updatedConsultationStorage,
          remaining: remainingConsultationStorage,
          total: userMaxConsultationStorage,
          usedMB: (updatedConsultationStorage / (1024 * 1024)).toFixed(2),
          remainingMB: (remainingConsultationStorage / (1024 * 1024)).toFixed(2)
        },
        total: {
          used: updatedTotalStorage,
          remaining: remainingTotalStorage,
          total: userMaxTotalStorage,
          usedMB: (updatedTotalStorage / (1024 * 1024)).toFixed(2),
          remainingMB: (remainingTotalStorage / (1024 * 1024)).toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document'
    });
  }
};

// Download document from consultation (retrieve base64 from database)
exports.downloadDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const userId = req.user.id;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is authorized (either client or lawyer)
    const user = await User.findById(userId);
    const lawyer = user && (user.role === 'lawyer' || user.role === 'tax-consultant' || user.role === 'auditor')
      ? await Lawyer.findOne({ userId: userId })
      : null;
    
    const isClient = consultation.clientId.toString() === userId;
    const isProfessional = lawyer && consultation.lawyerId.toString() === lawyer._id.toString();

    if (!isClient && !isProfessional) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access documents from this consultation'
      });
    }

    // Find document in consultation
    const document = consultation.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Send base64 data
    res.status(200).json({
      success: true,
      document: {
        originalName: document.originalName,
        mimetype: document.mimetype,
        size: document.size,
        data: document.data
      }
    });
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
};

// Delete document from consultation
exports.deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const userId = req.user.id;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is authorized (either client or lawyer)
    const user = await User.findById(userId);
    const lawyer = user && (user.role === 'lawyer' || user.role === 'tax-consultant' || user.role === 'auditor')
      ? await Lawyer.findOne({ userId: userId })
      : null;
    
    const isClient = consultation.clientId.toString() === userId;
    const isProfessional = lawyer && consultation.lawyerId.toString() === lawyer._id.toString();

    if (!isClient && !isProfessional) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete documents from this consultation'
      });
    }

    // Find document in consultation
    const document = consultation.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user uploaded this document (only uploader can delete)
    const userType = isProfessional ? 'professional' : 'client';
    if (document.uploadedBy !== userType) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete documents you uploaded'
      });
    }

    // Remove document from consultation using pull
    consultation.documents.pull(documentId);
    await consultation.save();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
};

// Get all documents for a consultation (without base64 data for performance)
exports.getDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is authorized (either client or lawyer)
    const user = await User.findById(userId);
    const lawyer = user && (user.role === 'lawyer' || user.role === 'tax-consultant' || user.role === 'auditor')
      ? await Lawyer.findOne({ userId: userId })
      : null;
    
    const isClient = consultation.clientId.toString() === userId;
    const isProfessional = lawyer && consultation.lawyerId.toString() === lawyer._id.toString();

    if (!isClient && !isProfessional) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access documents from this consultation'
      });
    }

    // Return documents without base64 data (for performance)
    const documents = consultation.documents.map(doc => ({
      _id: doc._id,
      originalName: doc.originalName,
      mimetype: doc.mimetype,
      size: doc.size,
      uploadedBy: doc.uploadedBy,
      uploadedAt: doc.uploadedAt
    }));

    res.status(200).json({
      success: true,
      documents: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
};
