// pages/api/webhooks/paystack.js
// Paystack webhook handler with automatic payment splitting

import { handlePaystackWebhook } from '@/lib/payments';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac('sha512', paystackSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const signature = req.headers['x-paystack-signature'];

    if (hash !== signature) {
      console.error('Invalid Paystack webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('Paystack webhook received:', req.body.event);

    // Process the webhook
    const result = await handlePaystackWebhook(req.body);

    if (result.success) {
      res.status(200).json({ message: 'Webhook processed successfully' });
    } else {
      console.error('Webhook processing failed:', result.error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }

  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// pages/api/webhooks/nowpayments.js
// NOWPayments webhook handler with automatic payment splitting

import { handleNOWPaymentsWebhook } from '@/lib/payments';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-nowpayments-sig'];
    
    console.log('NOWPayments webhook received:', req.body.payment_status);

    // Process the webhook
    const result = await handleNOWPaymentsWebhook(req.body, signature);

    if (result.success) {
      res.status(200).json({ message: 'Webhook processed successfully' });
    } else {
      console.error('NOWPayments webhook processing failed:', result.error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }

  } catch (error) {
    console.error('NOWPayments webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}





// pages/api/admin/vendors/setup-bank.js
// Admin API for setting up vendor bank accounts

import { paystackTransferManager } from '@/lib/paystack-transfer-manager';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { vendorId, bankDetails } = req.body;

    if (!vendorId || !bankDetails) {
      return res.status(400).json({ error: 'Vendor ID and bank details are required' });
    }

    // Validate required bank details
    const required = ['account_number', 'bank_code', 'bank_name'];
    const missing = required.filter(field => !bankDetails[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missing.join(', ')}` 
      });
    }

    const result = await paystackTransferManager.setupVendorBankAccount(vendorId, bankDetails);

    if (result.success) {
      res.status(200).json({
        message: 'Vendor bank account setup successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        error: result.error,
        message: 'Failed to setup vendor bank account'
      });
    }

  } catch (error) {
    console.error('Setup vendor bank API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// pages/api/admin/wallets/setup-crypto.js
// Admin API for setting up admin crypto wallets

import { cryptoPayoutManager } from '@/lib/crypto-payout-manager';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currency, walletAddress, walletType } = req.body;

    if (!currency || !walletAddress) {
      return res.status(400).json({ error: 'Currency and wallet address are required' });
    }

    const result = await cryptoPayoutManager.setupAdminWallet(
      currency, 
      walletAddress, 
      walletType || 'hot'
    );

    if (result.success) {
      res.status(200).json({
        message: 'Admin crypto wallet setup successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        error: result.error,
        message: 'Failed to setup admin crypto wallet'
      });
    }

  } catch (error) {
    console.error('Setup crypto wallet API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// pages/api/cron/daily-summary.js
// Cron job for daily payment summary (use with Vercel Cron or similar)

import { notificationManager } from '@/lib/notification-manager';

export default async function handler(req, res) {
  // Verify this is coming from your cron service
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await notificationManager.sendDailyPaymentSummary();
    
    if (result.success) {
      res.status(200).json({ message: 'Daily summary sent successfully' });
    } else {
      res.status(500).json({ 
        error: result.error,
        message: 'Failed to send daily summary' 
      });
    }

  } catch (error) {
    console.error('Daily summary cron error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// pages/api/cron/weekly-report.js
// Cron job for weekly payment report

import { notificationManager } from '@/lib/notification-manager';

export default async function handler(req, res) {
  // Verify this is coming from your cron service
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await notificationManager.sendWeeklyPaymentReport();
    
    if (result.success) {
      res.status(200).json({ message: 'Weekly report sent successfully' });
    } else {
      res.status(500).json({ 
        error: result.error,
        message: 'Failed to send weekly report' 
      });
    }

  } catch (error) {
    console.error('Weekly report cron error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}



export { handler as default };