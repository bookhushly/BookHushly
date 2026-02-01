import { paystackTransaction } from "./paystack-transaction";

/**
 * Payment Verification Service
 * Handles verification with retry logic and network resilience
 */
export class PaymentVerificationService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
    this.verificationCache = new Map();
    this.cacheExpiry = 60000; // 1 minute
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
   * @param {string} reference - Transaction reference
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<Object>}
   */
  async verifyWithRetry(reference, retryCount = 0) {
    try {
      // Check cache first
      const cached = this.getFromCache(reference);
      if (cached) {
        console.log(`Using cached verification for ${reference}`);
        return cached;
      }

      const result = await paystackTransaction.verify(reference);

      // Cache successful verifications
      if (result.status && result.transaction.status === "success") {
        this.addToCache(reference, result);
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
        return await this.verifyWithRetry(reference, retryCount + 1);
      }

      // Max retries exceeded
      throw new Error(
        `Payment verification failed after ${this.maxRetries} attempts: ${error.message}`,
      );
    }
  }

  /**
   * Verify payment amount matches expected
   * @param {Object} transaction - Transaction data
   * @param {number} expectedAmount - Expected amount in kobo
   * @returns {boolean}
   */
  verifyAmount(transaction, expectedAmount) {
    const actualAmount = transaction.amount;
    const expectedInKobo = Math.round(expectedAmount);

    if (actualAmount !== expectedInKobo) {
      console.error("Amount mismatch:", {
        expected: expectedInKobo,
        actual: actualAmount,
      });
      return false;
    }

    return true;
  }

  /**
   * Verify payment status
   * @param {Object} transaction - Transaction data
   * @returns {boolean}
   */
  verifyStatus(transaction) {
    return transaction.status === "success";
  }

  /**
   * Comprehensive payment verification
   * @param {string} reference - Transaction reference
   * @param {number} expectedAmount - Expected amount in kobo
   * @returns {Promise<Object>}
   */
  async comprehensiveVerify(reference, expectedAmount) {
    try {
      const result = await this.verifyWithRetry(reference);

      const isStatusValid = this.verifyStatus(result.transaction);
      const isAmountValid = this.verifyAmount(
        result.transaction,
        expectedAmount,
      );

      return {
        verified: isStatusValid && isAmountValid,
        transaction: result.transaction,
        statusValid: isStatusValid,
        amountValid: isAmountValid,
        message: this.getVerificationMessage(isStatusValid, isAmountValid),
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
   * @returns {string}
   */
  getVerificationMessage(statusValid, amountValid) {
    if (statusValid && amountValid) {
      return "Payment verified successfully";
    }

    if (!statusValid) {
      return "Payment was not successful";
    }

    if (!amountValid) {
      return "Payment amount does not match expected value";
    }

    return "Payment verification failed";
  }

  /**
   * Add verification to cache
   * @param {string} reference
   * @param {Object} data
   */
  addToCache(reference, data) {
    this.verificationCache.set(reference, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get verification from cache
   * @param {string} reference
   * @returns {Object|null}
   */
  getFromCache(reference) {
    const cached = this.verificationCache.get(reference);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.verificationCache.delete(reference);
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
   * Verify callback payment (from frontend callback)
   * @param {string} reference - Transaction reference
   * @returns {Promise<Object>}
   */
  async verifyCallback(reference) {
    // Frontend callbacks can be unreliable, always verify on backend
    console.log("Verifying callback payment:", reference);

    return await this.verifyWithRetry(reference);
  }
}

export const paymentVerification = new PaymentVerificationService();
