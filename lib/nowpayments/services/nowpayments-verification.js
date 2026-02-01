import { nowpaymentsTransaction } from "./nowpayments-transaction";
import { NOWPAYMENTS_PAYMENT_STATUS } from "../constants/payment-status";

/**
 * NOWPayments Verification Service
 * Handles payment verification with retry logic and amount checking
 */
export class NOWPaymentsVerificationService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 3000; // 3 seconds
    this.verificationCache = new Map();
    this.cacheExpiry = 120000; // 2 minutes
  }

  /**
   * Wait for specified time
   * @param {number} ms - Milliseconds to wait
   */
  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Verify payment with retry logic
   * @param {string|number} paymentId - NOWPayments payment ID
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<Object>}
   */
  async verifyWithRetry(paymentId, retryCount = 0) {
    try {
      // Check cache first
      const cached = this.getFromCache(paymentId);
      if (cached) {
        console.log(`Using cached verification for payment ${paymentId}`);
        return cached;
      }

      const result = await nowpaymentsTransaction.getPaymentStatus(paymentId);

      // Cache successful verifications
      if (result.payment_status === NOWPAYMENTS_PAYMENT_STATUS.FINISHED) {
        this.addToCache(paymentId, result);
      }

      return result;
    } catch (error) {
      console.error(
        `Verification attempt ${retryCount + 1} failed:`,
        error.message,
      );

      // Retry logic
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying verification in ${delay}ms...`);

        await this.wait(delay);
        return await this.verifyWithRetry(paymentId, retryCount + 1);
      }

      // Max retries exceeded
      throw new Error(
        `Payment verification failed after ${this.maxRetries} attempts: ${error.message}`,
      );
    }
  }

  /**
   * Verify payment amount matches expected
   * @param {Object} payment - Payment data from NOWPayments
   * @param {number} expectedAmount - Expected amount in fiat
   * @param {string} expectedCurrency - Expected currency
   * @returns {boolean}
   */
  verifyAmount(payment, expectedAmount, expectedCurrency = "usd") {
    const actualAmount = parseFloat(payment.price_amount);
    const expected = parseFloat(expectedAmount);
    const currency = payment.price_currency?.toLowerCase();
    const expectedCurr = expectedCurrency.toLowerCase();

    if (currency !== expectedCurr) {
      console.error("Currency mismatch:", {
        expected: expectedCurr,
        actual: currency,
      });
      return false;
    }

    // Allow 1% tolerance for floating point differences
    const tolerance = expected * 0.01;
    const difference = Math.abs(actualAmount - expected);

    if (difference > tolerance) {
      console.error("Amount mismatch:", {
        expected,
        actual: actualAmount,
        difference,
      });
      return false;
    }

    return true;
  }

  /**
   * Verify payment status is finished
   * @param {Object} payment - Payment data
   * @returns {boolean}
   */
  verifyStatus(payment) {
    return payment.payment_status === NOWPAYMENTS_PAYMENT_STATUS.FINISHED;
  }

  /**
   * Check if payment received sufficient amount
   * @param {Object} payment - Payment data
   * @returns {boolean}
   */
  verifyActuallyPaid(payment) {
    const actuallyPaid = parseFloat(payment.actually_paid || 0);
    const payAmount = parseFloat(payment.pay_amount || 0);

    // Check if customer paid enough (at least 95% of expected)
    const minimumAcceptable = payAmount * 0.95;

    if (actuallyPaid < minimumAcceptable) {
      console.error("Insufficient payment:", {
        expected: payAmount,
        received: actuallyPaid,
        currency: payment.pay_currency,
      });
      return false;
    }

    return true;
  }

  /**
   * Comprehensive payment verification
   * @param {string|number} paymentId - Payment ID
   * @param {number} expectedAmount - Expected amount in fiat
   * @param {string} expectedCurrency - Expected currency
   * @returns {Promise<Object>}
   */
  async comprehensiveVerify(
    paymentId,
    expectedAmount,
    expectedCurrency = "usd",
  ) {
    try {
      const payment = await this.verifyWithRetry(paymentId);

      const isStatusValid = this.verifyStatus(payment);
      const isAmountValid = this.verifyAmount(
        payment,
        expectedAmount,
        expectedCurrency,
      );
      const isActuallyPaidValid = this.verifyActuallyPaid(payment);

      return {
        verified: isStatusValid && isAmountValid && isActuallyPaidValid,
        payment,
        statusValid: isStatusValid,
        amountValid: isAmountValid,
        actuallyPaidValid: isActuallyPaidValid,
        message: this.getVerificationMessage(
          isStatusValid,
          isAmountValid,
          isActuallyPaidValid,
        ),
      };
    } catch (error) {
      return {
        verified: false,
        error: error.message,
        message: "Payment verification failed",
      };
    }
  }

  /**
   * Get verification message
   * @param {boolean} statusValid
   * @param {boolean} amountValid
   * @param {boolean} actuallyPaidValid
   * @returns {string}
   */
  getVerificationMessage(statusValid, amountValid, actuallyPaidValid) {
    if (statusValid && amountValid && actuallyPaidValid) {
      return "Payment verified successfully";
    }

    if (!statusValid) {
      return "Payment is not finished";
    }

    if (!amountValid) {
      return "Payment amount does not match expected value";
    }

    if (!actuallyPaidValid) {
      return "Customer did not pay sufficient amount";
    }

    return "Payment verification failed";
  }

  /**
   * Add verification to cache
   * @param {string|number} paymentId
   * @param {Object} data
   */
  addToCache(paymentId, data) {
    this.verificationCache.set(String(paymentId), {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get verification from cache
   * @param {string|number} paymentId
   * @returns {Object|null}
   */
  getFromCache(paymentId) {
    const cached = this.verificationCache.get(String(paymentId));

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.verificationCache.delete(String(paymentId));
      return null;
    }

    return cached.data;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.verificationCache.clear();
  }

  /**
   * Check payment status without full verification
   * @param {string|number} paymentId
   * @returns {Promise<Object>}
   */
  async checkStatus(paymentId) {
    try {
      const payment = await nowpaymentsTransaction.getPaymentStatus(paymentId);

      return {
        paymentId,
        status: payment.payment_status,
        priceAmount: payment.price_amount,
        priceCurrency: payment.price_currency,
        actuallyPaid: payment.actually_paid,
        payCurrency: payment.pay_currency,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
      };
    } catch (error) {
      return {
        paymentId,
        error: error.message,
        status: "unknown",
      };
    }
  }
}

export const nowpaymentsVerification = new NOWPaymentsVerificationService();
