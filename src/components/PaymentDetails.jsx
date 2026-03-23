import React, { useState, useEffect } from 'react';
import './PaymentDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PaymentDetails = () => {
  const [paymentDetails, setPaymentDetails] = useState({
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    accountHolderName: '',
    upiId: '',
    phonePeNumber: '',
    googlePayNumber: '',
    preferredPaymentMethod: 'upi'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const fetchPaymentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/payment-details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.paymentDetails) {
          setPaymentDetails({
            ...paymentDetails,
            ...data.paymentDetails,
            bankAccountNumber: '' // Don't populate masked value
          });
        }
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      
      // Only send fields that have values
      const dataToSend = {};
      Object.keys(paymentDetails).forEach(key => {
        if (paymentDetails[key] && paymentDetails[key].trim() !== '') {
          dataToSend[key] = paymentDetails[key];
        }
      });

      const response = await fetch(`${API_URL}/api/auth/payment-details`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Payment details updated successfully!' });
        setIsEditing(false);
        // Refresh to get masked bank account
        fetchPaymentDetails();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update payment details' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating payment details' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="payment-details-loading">Loading payment details...</div>;
  }

  return (
    <div className="payment-details-container">
      <div className="payment-details-header">
        <h2>💳 Payment Settlement Details</h2>
        <p className="payment-details-subtitle">
          Add your payment details for receiving consultation fees. LegalIQ will use these details for settlements.
        </p>
      </div>

      {message.text && (
        <div className={`payment-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-details-form">
        {/* Preferred Payment Method */}
        <div className="form-section">
          <h3>Preferred Payment Method</h3>
          <div className="form-group">
            <label htmlFor="preferredPaymentMethod">Select Preferred Method *</label>
            <select
              id="preferredPaymentMethod"
              name="preferredPaymentMethod"
              value={paymentDetails.preferredPaymentMethod}
              onChange={handleChange}
              disabled={!isEditing}
              required
            >
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="phonepe">PhonePe</option>
              <option value="googlepay">Google Pay</option>
            </select>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="form-section">
          <h3>🏦 Bank Account Details (Optional)</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="accountHolderName">Account Holder Name</label>
              <input
                type="text"
                id="accountHolderName"
                name="accountHolderName"
                value={paymentDetails.accountHolderName}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="As per bank records"
              />
            </div>
            <div className="form-group">
              <label htmlFor="bankAccountNumber">Account Number</label>
              <input
                type="text"
                id="bankAccountNumber"
                name="bankAccountNumber"
                value={paymentDetails.bankAccountNumber}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder={paymentDetails.bankAccountNumber?.startsWith('****') ? paymentDetails.bankAccountNumber : 'Enter account number'}
              />
              {paymentDetails.bankAccountNumber?.startsWith('****') && (
                <small className="field-hint">Account number is masked for security</small>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bankName">Bank Name</label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                value={paymentDetails.bankName}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., State Bank of India"
              />
            </div>
            <div className="form-group">
              <label htmlFor="ifscCode">IFSC Code</label>
              <input
                type="text"
                id="ifscCode"
                name="ifscCode"
                value={paymentDetails.ifscCode}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., SBIN0001234"
                maxLength={11}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>
        </div>

        {/* UPI Details */}
        <div className="form-section">
          <h3>📱 UPI Details (Optional)</h3>
          <div className="form-group">
            <label htmlFor="upiId">UPI ID</label>
            <input
              type="text"
              id="upiId"
              name="upiId"
              value={paymentDetails.upiId}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g., yourname@paytm, 9876543210@ybl"
            />
            <small className="field-hint">Your UPI ID for receiving payments</small>
          </div>
        </div>

        {/* Payment App Numbers */}
        <div className="form-section">
          <h3>💸 Payment App Numbers (Optional)</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phonePeNumber">PhonePe Number</label>
              <input
                type="tel"
                id="phonePeNumber"
                name="phonePeNumber"
                value={paymentDetails.phonePeNumber}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>
            <div className="form-group">
              <label htmlFor="googlePayNumber">Google Pay Number</label>
              <input
                type="tel"
                id="googlePayNumber"
                name="googlePayNumber"
                value={paymentDetails.googlePayNumber}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="payment-details-actions">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn-edit-payment"
            >
              ✏️ Edit Payment Details
            </button>
          ) : (
            <>
              <button
                type="submit"
                disabled={saving}
                className="btn-save-payment"
              >
                {saving ? 'Saving...' : '💾 Save Payment Details'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchPaymentDetails();
                  setMessage({ type: '', text: '' });
                }}
                className="btn-cancel-payment"
                disabled={saving}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <div className="payment-security-note">
          <p>🔒 <strong>Security Note:</strong> Your payment details are securely stored and encrypted. Bank account numbers are masked and only visible to authorized LegalIQ administrators for settlement processing.</p>
        </div>
      </form>
    </div>
  );
};

export default PaymentDetails;
