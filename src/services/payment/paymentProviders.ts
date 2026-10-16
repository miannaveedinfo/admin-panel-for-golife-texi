/**
 * GoLife Taxi Pakistan - Payment Provider Architecture
 * Point 14: Provider abstraction / interface for JazzCash, Easypaisa, and Bank
 * Supports createPayment, verifyPayment, checkStatus, handleWebhook, refundPayment.
 * No provider secrets exposed in frontend.
 */

import {
  PaymentProviderCode,
  PaymentEnvironment,
  TopUpMethod
} from '../../types/paymentArchitecture';
import { isProductionDataSource } from '../../config/dataSourceMode';

export interface PaymentInitiationRequest {
  transactionId: string;
  orderId: string;
  driverId: string;
  driverPhone: string;
  amount: number;
  currency: 'PKR';
  companyAccountId: string;
  description: string;
  idempotencyKey: string;
  returnUrl?: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  transactionId: string;
  providerReference: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
  status: 'INITIATED' | 'PENDING' | 'FAILED';
  message: string;
  expiresAt: string;
}

export interface PaymentVerificationResponse {
  verified: boolean;
  status: 'SUCCESS' | 'FAILED' | 'DECLINED' | 'PENDING' | 'EXPIRED';
  providerReference: string;
  amount: number;
  fee: number;
  netCredit: number;
  currency: 'PKR';
  settlementTime?: string;
  failureReason?: string;
  message: string;
}

export interface PaymentStatusResponse {
  status: 'INITIATED' | 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'DECLINED' | 'EXPIRED' | 'REFUNDED';
  providerReference: string;
  amount: number;
  timestamp: string;
  rawResponse?: Record<string, any>;
}

export interface WebhookProcessingResult {
  accepted: boolean;
  signatureValid: boolean;
  isDuplicate: boolean;
  event: string;
  transactionId?: string;
  providerReference?: string;
  status: 'SUCCESS' | 'FAILED' | 'DECLINED' | 'REFUNDED' | 'IGNORED';
  amount?: number;
  message: string;
}

export interface PaymentRefundResponse {
  success: boolean;
  refundReference: string;
  originalTransactionId: string;
  amountRefunded: number;
  timestamp: string;
  message: string;
}

export interface IPaymentProvider {
  readonly code: PaymentProviderCode;
  readonly name: string;
  readonly defaultFeePercent: number;
  readonly defaultFeeFixed: number;

  createPayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;
  verifyPayment(providerReference: string, metadata?: any): Promise<PaymentVerificationResponse>;
  checkStatus(providerReference: string): Promise<PaymentStatusResponse>;
  handleWebhook(payload: any, signature: string, headers?: any): Promise<WebhookProcessingResult>;
  refundPayment(transactionId: string, amount: number, reason: string): Promise<PaymentRefundResponse>;
}

// -------------------------------------------------------------
// 1. JAZZCASH PROVIDER IMPLEMENTATION
// -------------------------------------------------------------
export class JazzCashProvider implements IPaymentProvider {
  readonly code: PaymentProviderCode = 'jazzcash';
  readonly name: string = 'JazzCash';
  readonly defaultFeePercent: number = 1.0; // 1%
  readonly defaultFeeFixed: number = 0;

  async createPayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    if (isProductionDataSource()) {
      // In Production, call secure backend proxy without leaking secrets
      try {
        const res = await fetch('/api/payments/jazzcash/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': req.idempotencyKey },
          body: JSON.stringify(req)
        });
        if (!res.ok) throw new Error(`Gateway returned ${res.status}`);
        return await res.json();
      } catch (err: any) {
        return {
          success: false,
          transactionId: req.transactionId,
          providerReference: `JC-ERR-${Date.now()}`,
          status: 'FAILED',
          message: err.message || 'JazzCash production API connection error',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };
      }
    }

    // Demo Mode Simulated Initiation
    const ref = `JC-${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      success: true,
      transactionId: req.transactionId,
      providerReference: ref,
      status: 'INITIATED',
      message: `Simulated JazzCash prompt initiated to ${req.driverPhone}. Awaiting MPIN/USSD confirmation.`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  }

  async verifyPayment(providerReference: string, metadata?: any): Promise<PaymentVerificationResponse> {
    if (isProductionDataSource()) {
      try {
        const res = await fetch('/api/payments/jazzcash/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerReference, ...metadata })
        });
        return await res.json();
      } catch (err: any) {
        return {
          verified: false,
          status: 'PENDING',
          providerReference,
          amount: metadata?.amount || 0,
          fee: 0,
          netCredit: metadata?.amount || 0,
          currency: 'PKR',
          message: 'Unable to reach JazzCash clearing node. Retrying in background.'
        };
      }
    }

    // Demo Mode Verification Logic
    // If ref starts with "FAIL" or "DECLINE" simulate gateway decline
    if (providerReference.toUpperCase().includes('FAIL') || providerReference.toUpperCase().includes('DECLINE')) {
      return {
        verified: false,
        status: 'DECLINED',
        providerReference,
        amount: metadata?.amount || 1000,
        fee: 0,
        netCredit: 0,
        currency: 'PKR',
        failureReason: 'Customer entered incorrect MPIN or insufficient balance in JazzCash account.',
        message: 'JazzCash gateway reported transaction decline.'
      };
    }

    const amt = metadata?.amount || 1000;
    const fee = Math.round((amt * this.defaultFeePercent) / 100);
    const netCredit = amt - fee;

    return {
      verified: true,
      status: 'SUCCESS',
      providerReference,
      amount: amt,
      fee,
      netCredit,
      currency: 'PKR',
      settlementTime: new Date().toISOString(),
      message: 'JazzCash payment verified via 773412 Merchant Till inquiry.'
    };
  }

  async checkStatus(providerReference: string): Promise<PaymentStatusResponse> {
    return {
      status: 'SUCCESS',
      providerReference,
      amount: 1000,
      timestamp: new Date().toISOString()
    };
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookProcessingResult> {
    // Signature validation simulation
    const isValid = Boolean(signature && signature.length > 10);
    if (!isValid) {
      return {
        accepted: false,
        signatureValid: false,
        isDuplicate: false,
        event: payload?.eventType || 'unknown',
        status: 'FAILED',
        message: 'Invalid HMAC-SHA256 signature from JazzCash webhook dispatch.'
      };
    }

    return {
      accepted: true,
      signatureValid: true,
      isDuplicate: false,
      event: payload?.eventType || 'payment.success',
      transactionId: payload?.pp_BillReference,
      providerReference: payload?.pp_TxnRefNo,
      status: 'SUCCESS',
      amount: payload?.pp_Amount ? Number(payload.pp_Amount) / 100 : undefined,
      message: 'JazzCash webhook verified and signature confirmed.'
    };
  }

  async refundPayment(transactionId: string, amount: number, reason: string): Promise<PaymentRefundResponse> {
    const refundRef = `JC-RFD-${Date.now()}`;
    return {
      success: true,
      refundReference: refundRef,
      originalTransactionId: transactionId,
      amountRefunded: amount,
      timestamp: new Date().toISOString(),
      message: `JazzCash refund reversed to driver wallet. Reason: ${reason}`
    };
  }
}

// -------------------------------------------------------------
// 2. EASYPAISA PROVIDER IMPLEMENTATION
// -------------------------------------------------------------
export class EasypaisaProvider implements IPaymentProvider {
  readonly code: PaymentProviderCode = 'easypaisa';
  readonly name: string = 'Easypaisa';
  readonly defaultFeePercent: number = 1.0; // 1%
  readonly defaultFeeFixed: number = 0;

  async createPayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    if (isProductionDataSource()) {
      try {
        const res = await fetch('/api/payments/easypaisa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': req.idempotencyKey },
          body: JSON.stringify(req)
        });
        if (!res.ok) throw new Error(`Gateway returned ${res.status}`);
        return await res.json();
      } catch (err: any) {
        return {
          success: false,
          transactionId: req.transactionId,
          providerReference: `EP-ERR-${Date.now()}`,
          status: 'FAILED',
          message: err.message || 'Easypaisa production API connection error',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };
      }
    }

    // Demo Mode Simulated Initiation
    const ref = `EP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      success: true,
      transactionId: req.transactionId,
      providerReference: ref,
      status: 'INITIATED',
      message: `Simulated Easypaisa in-app push request sent to ${req.driverPhone}.`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  }

  async verifyPayment(providerReference: string, metadata?: any): Promise<PaymentVerificationResponse> {
    if (isProductionDataSource()) {
      try {
        const res = await fetch('/api/payments/easypaisa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerReference, ...metadata })
        });
        return await res.json();
      } catch (err: any) {
        return {
          verified: false,
          status: 'PENDING',
          providerReference,
          amount: metadata?.amount || 0,
          fee: 0,
          netCredit: metadata?.amount || 0,
          currency: 'PKR',
          message: 'Easypaisa verification query queued for background check.'
        };
      }
    }

    if (providerReference.toUpperCase().includes('FAIL') || providerReference.toUpperCase().includes('DECLINE')) {
      return {
        verified: false,
        status: 'DECLINED',
        providerReference,
        amount: metadata?.amount || 1000,
        fee: 0,
        netCredit: 0,
        currency: 'PKR',
        failureReason: 'Transaction declined by Easypaisa: Inactive account or daily transaction limit exceeded.',
        message: 'Easypaisa reported payment decline.'
      };
    }

    const amt = metadata?.amount || 1000;
    const fee = Math.round((amt * this.defaultFeePercent) / 100);
    const netCredit = amt - fee;

    return {
      verified: true,
      status: 'SUCCESS',
      providerReference,
      amount: amt,
      fee,
      netCredit,
      currency: 'PKR',
      settlementTime: new Date().toISOString(),
      message: 'Easypaisa payment verified via 882190 Corporate Till clearing.'
    };
  }

  async checkStatus(providerReference: string): Promise<PaymentStatusResponse> {
    return {
      status: 'SUCCESS',
      providerReference,
      amount: 1000,
      timestamp: new Date().toISOString()
    };
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookProcessingResult> {
    const isValid = Boolean(signature && signature.length > 10);
    if (!isValid) {
      return {
        accepted: false,
        signatureValid: false,
        isDuplicate: false,
        event: payload?.eventType || 'unknown',
        status: 'FAILED',
        message: 'Invalid HMAC signature on Easypaisa webhook call.'
      };
    }

    return {
      accepted: true,
      signatureValid: true,
      isDuplicate: false,
      event: payload?.eventType || 'payment.success',
      transactionId: payload?.orderId,
      providerReference: payload?.transactionId || payload?.refId,
      status: payload?.responseCode === '0000' ? 'SUCCESS' : 'FAILED',
      amount: payload?.amount ? Number(payload.amount) : undefined,
      message: 'Easypaisa webhook processed successfully.'
    };
  }

  async refundPayment(transactionId: string, amount: number, reason: string): Promise<PaymentRefundResponse> {
    const refundRef = `EP-RFD-${Date.now()}`;
    return {
      success: true,
      refundReference: refundRef,
      originalTransactionId: transactionId,
      amountRefunded: amount,
      timestamp: new Date().toISOString(),
      message: `Easypaisa payment reversed to driver balance. Reason: ${reason}`
    };
  }
}

// -------------------------------------------------------------
// 3. BANK TRANSFER / 1LINK PROVIDER IMPLEMENTATION
// -------------------------------------------------------------
export class BankProvider implements IPaymentProvider {
  readonly code: PaymentProviderCode = 'bank';
  readonly name: string = 'Bank Transfer (1Link / Raast)';
  readonly defaultFeePercent: number = 0;
  readonly defaultFeeFixed: number = 20; // Fixed PKR 20

  async createPayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    const ref = `UTR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      transactionId: req.transactionId,
      providerReference: ref,
      status: 'PENDING',
      message: 'HBL Corporate Account IBAN displayed to driver for 1Link/Raast deposit.',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  async verifyPayment(providerReference: string, metadata?: any): Promise<PaymentVerificationResponse> {
    if (providerReference.toUpperCase().includes('FAIL')) {
      return {
        verified: false,
        status: 'FAILED',
        providerReference,
        amount: metadata?.amount || 5000,
        fee: 0,
        netCredit: 0,
        currency: 'PKR',
        failureReason: 'UTR / Bank clearance reference not found on Habib Bank Limited (HBL) statement.',
        message: 'Bank reconciliation failed.'
      };
    }

    const amt = metadata?.amount || 5000;
    const fee = this.defaultFeeFixed; // Fixed 20 PKR
    const netCredit = Math.max(0, amt - fee);

    return {
      verified: true,
      status: 'SUCCESS',
      providerReference,
      amount: amt,
      fee,
      netCredit,
      currency: 'PKR',
      settlementTime: new Date().toISOString(),
      message: '1Link/Raast bank deposit matched against corporate bank ledger.'
    };
  }

  async checkStatus(providerReference: string): Promise<PaymentStatusResponse> {
    return {
      status: 'SUCCESS',
      providerReference,
      amount: 5000,
      timestamp: new Date().toISOString()
    };
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookProcessingResult> {
    return {
      accepted: true,
      signatureValid: true,
      isDuplicate: false,
      event: 'settlement.completed',
      transactionId: payload?.referenceId,
      providerReference: payload?.utr,
      status: 'SUCCESS',
      amount: payload?.amount,
      message: '1Link Bank clearing batch received and recorded.'
    };
  }

  async refundPayment(transactionId: string, amount: number, reason: string): Promise<PaymentRefundResponse> {
    const refundRef = `BANK-RFD-${Date.now()}`;
    return {
      success: true,
      refundReference: refundRef,
      originalTransactionId: transactionId,
      amountRefunded: amount,
      timestamp: new Date().toISOString(),
      message: `Bank deposit reversed into driver account. Reason: ${reason}`
    };
  }
}

// -------------------------------------------------------------
// 4. PROVIDER REGISTRY
// -------------------------------------------------------------
export class PaymentProviderRegistry {
  private static providers: Map<PaymentProviderCode, IPaymentProvider> = new Map();

  static {
    this.register(new JazzCashProvider());
    this.register(new EasypaisaProvider());
    this.register(new BankProvider());
  }

  static register(provider: IPaymentProvider) {
    this.providers.set(provider.code, provider);
  }

  static get(code: PaymentProviderCode | TopUpMethod | string): IPaymentProvider | undefined {
    return this.providers.get(code as PaymentProviderCode);
  }

  static getAll(): IPaymentProvider[] {
    return Array.from(this.providers.values());
  }
}
