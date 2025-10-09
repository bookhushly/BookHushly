// lib/wallet-service.js
// Production-Ready Wallet Management Service with Cookie-Based Auth

import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  initializePaystackPayments,
  createNOWPaymentsInvoice,
  verifyPaystackPayment,
  verifyNOWPaymentsPayment,
  getExchangeRate,
} from "./payments";

class WalletService {
  async getSupabaseClient() {
    return await createServerClient();
  }

  /**
   * Get user's wallet with balance
   */
  async getWallet(userId) {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Get wallet error:", error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get or create wallet for user
   */
  async getOrCreateWallet(userId) {
    try {
      const supabase = await this.getSupabaseClient();

      // Try to get existing wallet
      let { data: wallet, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      // If wallet doesn't exist, create it
      if (!wallet && !error) {
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({
            user_id: userId,
            balance: 0.0,
            currency: "NGN",
            status: "active",
            is_locked: false,
          })
          .select()
          .single();

        if (createError) throw createError;
        wallet = newWallet;
      } else if (error) {
        throw error;
      }

      return { data: wallet, error: null };
    } catch (error) {
      console.error("Get or create wallet error:", error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Check if user has sufficient balance
   */
  async hasSufficientBalance(userId, amount) {
    try {
      const { data: wallet, error } = await this.getWallet(userId);

      if (error) throw error;

      if (!wallet) {
        return { sufficient: false, error: "Wallet not found" };
      }

      if (wallet.is_locked) {
        return {
          sufficient: false,
          error: `Wallet is locked: ${wallet.locked_reason || "Unknown reason"}`,
        };
      }

      const sufficient = parseFloat(wallet.balance) >= parseFloat(amount);

      return {
        sufficient,
        balance: wallet.balance,
        error: sufficient ? null : "Insufficient balance",
      };
    } catch (error) {
      return { sufficient: false, error: error.message };
    }
  }

  /**
   * Lock wallet
   */
  async lockWallet(userId, reason) {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from("wallets")
        .update({
          is_locked: true,
          locked_reason: reason,
          locked_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Lock wallet error:", error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Unlock wallet
   */
  async unlockWallet(userId) {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from("wallets")
        .update({
          is_locked: false,
          locked_reason: null,
          locked_at: null,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Unlock wallet error:", error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Initialize wallet deposit via Paystack
   */
  async initializeDeposit(userId, amount, userEmail, userName) {
    try {
      if (amount < 100) {
        throw new Error("Minimum deposit amount is ₦100");
      }

      const supabase = await this.getSupabaseClient();

      // Get or create wallet
      const { data: wallet, error: walletError } =
        await this.getOrCreateWallet(userId);

      if (walletError || !wallet) {
        throw new Error(walletError || "Failed to get wallet");
      }

      if (wallet.is_locked) {
        throw new Error(
          `Wallet is locked: ${wallet.locked_reason || "Unknown reason"}`
        );
      }

      const reference = `WD-${Date.now()}-${userId.substring(0, 8)}`;

      const { data: transaction, error: txError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          transaction_type: "deposit",
          amount: amount,
          currency: "NGN",
          balance_before: wallet.balance,
          balance_after: wallet.balance,
          status: "pending",
          payment_provider: "paystack",
          payment_reference: reference,
          description: "Wallet deposit via Paystack",
          metadata: {
            user_name: userName,
            initiated_at: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (txError) throw txError;

      const paymentData = {
        email: userEmail,
        amount: amount,
        reference: reference,
        currency: "NGN",
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/deposit/callback?reference=${reference}`,
        metadata: {
          transaction_id: transaction.id,
          wallet_id: wallet.id,
          user_id: userId,
          transaction_type: "wallet_deposit",
        },
      };

      const paymentResult = await initializePaystackPayments(paymentData);

      if (paymentResult.error) {
        await supabase
          .from("wallet_transactions")
          .update({
            status: "failed",
            error_message: paymentResult.error,
            failed_at: new Date().toISOString(),
          })
          .eq("id", transaction.id);

        throw new Error(paymentResult.error);
      }

      return {
        data: {
          transaction_id: transaction.id,
          reference: reference,
          authorization_url: paymentResult.data.authorization_url,
        },
        error: null,
      };
    } catch (error) {
      console.error("Initialize deposit error:", error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Initialize crypto deposit with conversion to NGN
   */
  async initializeCryptoDeposit(userId, ngnAmount, cryptoCurrency, userEmail) {
    try {
      if (ngnAmount < 1000) {
        throw new Error("Minimum crypto deposit is ₦1,000");
      }

      const supabase = await this.getSupabaseClient();

      // Get or create wallet
      const { data: wallet, error: walletError } =
        await this.getOrCreateWallet(userId);

      if (walletError || !wallet) {
        throw new Error(walletError || "Failed to get wallet");
      }

      if (wallet.is_locked) {
        throw new Error(
          `Wallet is locked: ${wallet.locked_reason || "Unknown reason"}`
        );
      }

      const { data: exchangeData, error: exchangeError } =
        await getExchangeRate(ngnAmount, "NGN", "USD");

      if (exchangeError || !exchangeData) {
        throw new Error("Failed to get exchange rate");
      }

      const usdAmount = exchangeData.result;
      const reference = `WC-${Date.now()}-${userId.substring(0, 8)}`;

      const { data: transaction, error: txError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          transaction_type: "deposit",
          amount: ngnAmount,
          currency: "NGN",
          balance_before: wallet.balance,
          balance_after: wallet.balance,
          status: "pending",
          payment_provider: "crypto",
          payment_reference: reference,
          description: `Wallet deposit via ${cryptoCurrency.toUpperCase()}`,
          metadata: {
            crypto_currency: cryptoCurrency,
            usd_amount: usdAmount,
            exchange_rate: exchangeData.info.quote,
            initiated_at: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (txError) throw txError;

      const invoiceData = {
        amount: usdAmount,
        currency: "USD",
        reference: reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/deposit/callback?reference=${reference}`,
        metadata: {
          transaction_id: transaction.id,
          wallet_id: wallet.id,
          user_id: userId,
          transaction_type: "wallet_deposit",
          ngn_amount: ngnAmount,
        },
      };

      const invoiceResult = await createNOWPaymentsInvoice(
        invoiceData,
        cryptoCurrency
      );

      if (invoiceResult.error) {
        await supabase
          .from("wallet_transactions")
          .update({
            status: "failed",
            error_message: invoiceResult.error,
            failed_at: new Date().toISOString(),
          })
          .eq("id", transaction.id);

        throw new Error(invoiceResult.error);
      }

      const { error: cryptoError } = await supabase
        .from("crypto_deposits")
        .insert({
          wallet_transaction_id: transaction.id,
          user_id: userId,
          crypto_amount: invoiceResult.data.pay_amount,
          crypto_currency: cryptoCurrency.toUpperCase(),
          ngn_amount: ngnAmount,
          exchange_rate: exchangeData.info.quote,
          payment_id: invoiceResult.data.invoice_id,
          payment_address: invoiceResult.data.pay_address,
          invoice_url: invoiceResult.data.invoice_url,
          conversion_status: "pending",
          nowpayments_status: invoiceResult.data.payment_status,
          payment_data: invoiceResult.data,
        });

      if (cryptoError) throw cryptoError;

      return {
        data: {
          transaction_id: transaction.id,
          reference: reference,
          invoice_url: invoiceResult.data.invoice_url,
          pay_address: invoiceResult.data.pay_address,
          pay_amount: invoiceResult.data.pay_amount,
          pay_currency: cryptoCurrency.toUpperCase(),
          ngn_amount: ngnAmount,
        },
        error: null,
      };
    } catch (error) {
      console.error("Initialize crypto deposit error:", error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Verify and complete deposit
   */
  async verifyDeposit(reference) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 VERIFY DEPOSIT STARTED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Payment Reference:", reference);
    console.log("⏰ Timestamp:", new Date().toISOString());

    try {
      // Step 1: Get Supabase client
      console.log("\n📡 Step 1: Getting Supabase client...");
      const supabase = await this.getSupabaseClient();
      console.log("✅ Supabase client obtained");

      // Step 2: Fetch transaction from database
      console.log("\n📡 Step 2: Fetching transaction from database...");
      console.log(
        "🔍 Query: wallet_transactions WHERE payment_reference =",
        reference
      );

      const { data: transaction, error: txError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("payment_reference", reference)
        .single();

      if (txError) {
        console.error("❌ Transaction fetch error:", txError);
        throw txError;
      }

      console.log("✅ Transaction found:");
      console.log("  - Transaction ID:", transaction.id);
      console.log("  - User ID:", transaction.user_id);
      console.log("  - Wallet ID:", transaction.wallet_id);
      console.log("  - Amount:", transaction.amount);
      console.log("  - Currency:", transaction.currency);
      console.log("  - Status:", transaction.status);
      console.log("  - Payment Provider:", transaction.payment_provider);
      console.log("  - Created At:", transaction.created_at);
      console.log("  - Balance Before:", transaction.balance_before);

      // Step 3: Check if already completed
      console.log("\n🔍 Step 3: Checking transaction status...");
      if (transaction.status === "completed") {
        console.log("⚠️  Transaction already completed!");
        console.log("📤 Returning early with already_completed status");
        return {
          data: { status: "already_completed", transaction },
          error: null,
        };
      }
      console.log(
        "✅ Transaction status is:",
        transaction.status,
        "- proceeding with verification"
      );

      // Step 4: Verify with payment provider
      console.log("\n📡 Step 4: Verifying payment with provider...");
      console.log("💳 Payment Provider:", transaction.payment_provider);

      let verificationResult;

      if (transaction.payment_provider === "paystack") {
        console.log("🔵 Using Paystack verification");
        console.log(
          "📞 Calling verifyPaystackPayment with reference:",
          reference
        );
        verificationResult = await verifyPaystackPayment(reference);
        console.log("📥 Paystack verification result:", {
          hasData: !!verificationResult.data,
          hasError: !!verificationResult.error,
          status: verificationResult.data?.status,
        });
      } else if (transaction.payment_provider === "crypto") {
        console.log("🟡 Using Crypto (NOWPayments) verification");
        console.log("📞 Fetching crypto deposit record...");

        const { data: cryptoDeposit, error: cryptoError } = await supabase
          .from("crypto_deposits")
          .select("payment_id")
          .eq("wallet_transaction_id", transaction.id)
          .single();

        if (cryptoError) {
          console.error("❌ Crypto deposit fetch error:", cryptoError);
          throw cryptoError;
        }

        console.log("✅ Crypto deposit found:");
        console.log("  - Payment ID:", cryptoDeposit.payment_id);
        console.log(
          "📞 Calling verifyNOWPaymentsPayment with payment_id:",
          cryptoDeposit.payment_id
        );

        verificationResult = await verifyNOWPaymentsPayment(
          cryptoDeposit.payment_id
        );
        console.log("📥 NOWPayments verification result:", {
          hasData: !!verificationResult.data,
          hasError: !!verificationResult.error,
          payment_status: verificationResult.data?.payment_status,
        });
      } else {
        console.error(
          "❌ Unknown payment provider:",
          transaction.payment_provider
        );
        throw new Error(
          "Unknown payment provider: " + transaction.payment_provider
        );
      }

      // Step 5: Check verification result
      console.log("\n🔍 Step 5: Processing verification result...");
      console.log(
        "📊 Full verification result:",
        JSON.stringify(verificationResult, null, 2)
      );

      if (verificationResult.error) {
        console.error(
          "❌ Verification returned error:",
          verificationResult.error
        );
        throw new Error(verificationResult.error);
      }
      console.log("✅ Verification completed without errors");

      // Step 6: Determine success status
      console.log("\n🔍 Step 6: Determining payment success status...");
      console.log("🔍 Checking conditions:");
      console.log(
        "  - verificationResult.data.status:",
        verificationResult.data?.status
      );
      console.log(
        "  - verificationResult.data.payment_status:",
        verificationResult.data?.payment_status
      );

      const isSuccess =
        verificationResult.data.status === "success" ||
        verificationResult.data.payment_status === "finished";

      console.log("📊 Payment Success:", isSuccess ? "✅ YES" : "❌ NO");

      if (isSuccess) {
        console.log("\n🎉 PAYMENT SUCCESSFUL - Processing completion...");

        // Step 7a: Get current wallet balance
        console.log("\n📡 Step 7a: Fetching current wallet balance...");
        const { data: wallet, error: walletError } = await supabase
          .from("wallets")
          .select("balance")
          .eq("id", transaction.wallet_id)
          .single();

        if (walletError) {
          console.error("❌ Wallet fetch error:", walletError);
          throw walletError;
        }

        console.log("✅ Current wallet balance:", wallet.balance);
        console.log("💰 Transaction amount:", transaction.amount);

        const newBalance =
          parseFloat(wallet.balance) + parseFloat(transaction.amount);

        console.log("💵 Calculated new balance:", newBalance);
        console.log(
          "  = Current (",
          wallet.balance,
          ") + Amount (",
          transaction.amount,
          ")"
        );

        // Step 7b: Update wallet balance
        console.log("\n📡 Step 7b: Updating wallet balance...");
        const { data: updatedWallet, error: updateError } = await supabase
          .from("wallets")
          .update({ balance: newBalance })
          .eq("id", transaction.wallet_id)
          .select();

        if (updateError) {
          console.error("❌ Wallet update error:", updateError);
          throw updateError;
        }
        console.log("✅ Wallet balance updated successfully");

        // Step 7c: Update transaction status
        console.log(
          "\n📡 Step 7c: Updating transaction status to completed..."
        );
        const transactionUpdate = {
          status: "completed",
          balance_after: newBalance,
          processed_at: new Date().toISOString(),
          metadata: {
            ...transaction.metadata,
            verification_data: verificationResult.data,
          },
        };
        console.log("📝 Transaction update data:", transactionUpdate);

        const { data: updatedTransaction, error: txUpdateError } =
          await supabase
            .from("wallet_transactions")
            .update(transactionUpdate)
            .eq("id", transaction.id)
            .select();

        if (txUpdateError) {
          console.error("❌ Transaction update error:", txUpdateError);
          throw txUpdateError;
        }
        console.log("✅ Transaction status updated to completed");

        // Step 7d: Update crypto deposit if applicable
        if (transaction.payment_provider === "crypto") {
          console.log("\n📡 Step 7d: Updating crypto deposit status...");
          const { data: updatedCrypto, error: cryptoUpdateError } =
            await supabase
              .from("crypto_deposits")
              .update({
                conversion_status: "completed",
                converted_at: new Date().toISOString(),
              })
              .eq("wallet_transaction_id", transaction.id)
              .select();

          if (cryptoUpdateError) {
            console.error("❌ Crypto deposit update error:", cryptoUpdateError);
            throw cryptoUpdateError;
          }
          console.log("✅ Crypto deposit marked as completed");
        }

        // Step 8: Return success response
        console.log("\n🎊 SUCCESS - Deposit verified and processed!");
        const successResponse = {
          data: {
            status: "success",
            amount: transaction.amount,
            new_balance: newBalance,
            transaction,
          },
          error: null,
        };
        console.log("📤 Returning success response:", {
          status: successResponse.data.status,
          amount: successResponse.data.amount,
          new_balance: successResponse.data.new_balance,
          transaction_id: transaction.id,
        });
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return successResponse;
      } else {
        // Payment verification failed
        console.log("\n❌ PAYMENT VERIFICATION FAILED");
        console.log(
          "📊 Gateway Response:",
          verificationResult.data?.gateway_response
        );

        // Step 7 (failure): Update transaction to failed
        console.log("\n📡 Step 7 (failure): Marking transaction as failed...");
        const failedUpdate = {
          status: "failed",
          failed_at: new Date().toISOString(),
          error_message:
            verificationResult.data?.gateway_response ||
            "Payment verification failed",
        };
        console.log("📝 Failed transaction update:", failedUpdate);

        const { data: failedTransaction, error: failedUpdateError } =
          await supabase
            .from("wallet_transactions")
            .update(failedUpdate)
            .eq("id", transaction.id)
            .select();

        if (failedUpdateError) {
          console.error(
            "❌ Failed transaction update error:",
            failedUpdateError
          );
          throw failedUpdateError;
        }
        console.log("✅ Transaction marked as failed");

        const failureResponse = {
          data: { status: "failed", transaction },
          error: "Payment verification failed",
        };
        console.log("📤 Returning failure response:", failureResponse);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return failureResponse;
      }
    } catch (error) {
      console.error("\n💥 VERIFY DEPOSIT ERROR");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ Error Type:", error.constructor.name);
      console.error("❌ Error Message:", error.message);
      console.error("❌ Error Stack:", error.stack);
      console.error("📋 Reference:", reference);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return { data: null, error: error.message };
    }
  }

  /**
   * Pay for booking from wallet
   */
  async payFromWallet(userId, bookingId, amount) {
    try {
      const supabase = await this.getSupabaseClient();

      const { data: wallet, error: walletError } = await this.getWallet(userId);
      if (walletError || !wallet)
        throw new Error(walletError || "Wallet not found");

      if (wallet.is_locked) {
        throw new Error(
          `Wallet is locked: ${wallet.locked_reason || "Unknown reason"}`
        );
      }

      if (parseFloat(wallet.balance) < parseFloat(amount)) {
        throw new Error("Insufficient wallet balance");
      }

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*, listings(*)")
        .eq("id", bookingId)
        .single();

      if (bookingError) throw bookingError;

      const reference = `WP-${Date.now()}-${bookingId}`;
      const newBalance = parseFloat(wallet.balance) - parseFloat(amount);

      const { data: transaction, error: txError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          transaction_type: "payment",
          amount: amount,
          currency: "NGN",
          balance_before: wallet.balance,
          balance_after: newBalance,
          status: "completed",
          payment_provider: "wallet",
          payment_reference: reference,
          description: `Payment for ${booking.listings.title}`,
          booking_id: bookingId,
          processed_at: new Date().toISOString(),
          metadata: {
            booking_id: bookingId,
            service_title: booking.listings.title,
            vendor_id: booking.vendor_id,
          },
        })
        .select()
        .single();

      if (txError) throw txError;

      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", wallet.id);

      if (updateError) throw updateError;

      await supabase
        .from("bookings")
        .update({
          payment_status: "completed",
          payment_reference: reference,
          payment_method: "wallet",
          status: "confirmed",
        })
        .eq("id", bookingId);

      return {
        data: {
          transaction_id: transaction.id,
          reference: reference,
          amount: amount,
          new_balance: newBalance,
          booking_id: bookingId,
        },
        error: null,
      };
    } catch (error) {
      console.error("Pay from wallet error:", error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Request withdrawal to bank account
   */
  async requestWithdrawal(userId, amount, bankAccountId) {
    try {
      if (amount < 500) {
        throw new Error("Minimum withdrawal amount is ₦500");
      }

      const supabase = await this.getSupabaseClient();

      const { data: wallet, error: walletError } = await this.getWallet(userId);
      if (walletError || !wallet)
        throw new Error(walletError || "Wallet not found");

      if (parseFloat(wallet.balance) < parseFloat(amount)) {
        throw new Error("Insufficient wallet balance");
      }

      const { data: bankAccount, error: bankError } = await supabase
        .from("user_bank_accounts")
        .select("*")
        .eq("id", bankAccountId)
        .eq("user_id", userId)
        .single();

      if (bankError) throw bankError;

      const reference = `WW-${Date.now()}-${userId.substring(0, 8)}`;
      const newBalance = parseFloat(wallet.balance) - parseFloat(amount);

      const { data: transaction, error: txError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          transaction_type: "withdrawal",
          amount: amount,
          currency: "NGN",
          balance_before: wallet.balance,
          balance_after: newBalance,
          status: "processing",
          payment_reference: reference,
          description: `Withdrawal to ${bankAccount.bank_name}`,
          metadata: {
            bank_account_id: bankAccountId,
            account_number: bankAccount.account_number,
            bank_name: bankAccount.bank_name,
          },
        })
        .select()
        .single();

      if (txError) throw txError;

      const { data: withdrawal, error: withdrawalError } = await supabase
        .from("withdrawal_requests")
        .insert({
          wallet_transaction_id: transaction.id,
          user_id: userId,
          amount: amount,
          currency: "NGN",
          bank_name: bankAccount.bank_name,
          account_number: bankAccount.account_number,
          account_name: bankAccount.account_name,
          status: "pending",
        })
        .select()
        .single();

      if (withdrawalError) throw withdrawalError;

      await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", wallet.id);

      return {
        data: {
          withdrawal_id: withdrawal.id,
          transaction_id: transaction.id,
          reference: reference,
          amount: amount,
          new_balance: newBalance,
          status: "pending",
        },
        error: null,
      };
    } catch (error) {
      console.error("Request withdrawal error:", error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId, filters = {}) {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (filters.type) {
        query = query.eq("transaction_type", filters.type);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Get transactions error:", error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStatistics(userId) {
    try {
      const { data: transactions, error } = await this.getTransactions(userId);

      if (error) throw error;

      const stats = {
        total_deposits: 0,
        total_withdrawals: 0,
        total_payments: 0,
        transaction_count: transactions.length,
        recent_transactions: transactions.slice(0, 5),
      };

      transactions.forEach((tx) => {
        if (tx.status === "completed") {
          switch (tx.transaction_type) {
            case "deposit":
              stats.total_deposits += parseFloat(tx.amount);
              break;
            case "withdrawal":
              stats.total_withdrawals += parseFloat(tx.amount);
              break;
            case "payment":
              stats.total_payments += parseFloat(tx.amount);
              break;
          }
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error("Get wallet statistics error:", error);
      return { data: null, error: error.message };
    }
  }
}

export const walletService = new WalletService();
export default WalletService;
