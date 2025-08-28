// Mock payment service for demo purposes
// This simulates payment processing without requiring database setup

export interface MockPaymentData {
  payment_id: number;
  member_id: number;
  amount: number;
  payment_method: string;
  status: 'completed' | 'failed' | 'refunded';
  transaction_id: string;
  date: string;
}

export interface MockPaymentRequest {
  member_id: number;
  amount: number;
  payment_method: string;
}

export interface MockPaymentResult {
  success: boolean;
  payment_id?: number;
  transaction_id?: string;
  error?: string;
}

class MockPaymentService {
  private payments: Map<number, MockPaymentData> = new Map();
  private nextPaymentId = 1;

  async processPayment(paymentData: MockPaymentRequest): Promise<MockPaymentResult> {
    console.log('Mock payment processing:', paymentData);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate 95% success rate for demo
    const isSuccess = Math.random() > 0.05;
    
    if (!isSuccess) {
      return {
        success: false,
        error: 'Payment failed - simulated failure for demo'
      };
    }

    // Create mock payment record
    const paymentId = this.nextPaymentId++;
    const transactionId = `demo_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment: MockPaymentData = {
      payment_id: paymentId,
      member_id: paymentData.member_id,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      status: 'completed',
      transaction_id: transactionId,
      date: new Date().toISOString()
    };

    this.payments.set(paymentId, payment);
    
    console.log('Mock payment created:', payment);

    return {
      success: true,
      payment_id: paymentId,
      transaction_id: transactionId
    };
  }

  async processRefund(payment_id: number): Promise<MockPaymentResult> {
    console.log('Mock refund processing for payment:', payment_id);
    
    const payment = this.payments.get(payment_id);
    if (!payment) {
      return {
        success: false,
        error: 'Payment not found'
      };
    }

    // Simulate refund processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    payment.status = 'refunded';
    this.payments.set(payment_id, payment);

    return {
      success: true,
      payment_id: payment_id,
      transaction_id: `refund_${payment.transaction_id}`
    };
  }

  getPayment(payment_id: number): MockPaymentData | null {
    return this.payments.get(payment_id) || null;
  }

  getAllPayments(): MockPaymentData[] {
    return Array.from(this.payments.values());
  }
}

export const mockPaymentService = new MockPaymentService();
