import { createClient } from '../lib/supabase/client';

export interface PaymentData {
  payment_id?: number;
  member_id: number;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date?: string;
  created_at?: string;
}

export interface CreatePaymentRequest {
  member_id: number;
  amount: number;
  payment_method: string;
}

export interface PaymentProcessingResult {
  success: boolean;
  payment_id?: string;
  transaction_id?: string;
  error?: string;
}

export class PaymentService {
  private supabase = createClient();

  // Demo payment processing - simulates payment gateway
  async processPayment(paymentData: CreatePaymentRequest): Promise<PaymentProcessingResult> {
    console.log('Processing payment with data:', paymentData);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate 90% success rate for demo purposes
      const isSuccess = Math.random() > 0.1;
      
      if (!isSuccess) {
        console.log('Simulated payment failure');
        return {
          success: false,
          error: 'Payment failed - simulated failure for demo'
        };
      }

      // Generate mock transaction ID
      const transaction_id = `demo_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Attempting to create payment record in database...');
      
      // Create payment record
      const { data: payment, error } = await this.supabase
        .from('Payments')
        .insert({
          member_id: paymentData.member_id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          status: 'completed',
          date: new Date().toISOString()
        })
        .select()
        .single();

      console.log('Database response:', { payment, error });

      if (error) {
        console.error('Error creating payment record:', error);
        console.error('Payment data attempted:', {
          member_id: paymentData.member_id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          status: 'completed',
          date: new Date().toISOString()
        });
        return {
          success: false,
          error: `Failed to record payment: ${error.message || 'Unknown error'}`
        };
      }

      return {
        success: true,
        payment_id: payment.payment_id,
        transaction_id: transaction_id
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: 'Payment processing failed'
      };
    }
  }

  // Process refund
  async processRefund(payment_id: string): Promise<PaymentProcessingResult> {
    try {
      // Simulate refund processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update payment status to refunded
      const { data: payment, error } = await this.supabase
        .from('Payments')
        .update({ 
          status: 'refunded',
          // In a real system, you'd also record refund_date, refund_transaction_id, etc.
        })
        .eq('payment_id', payment_id)
        .select()
        .single();

      if (error) {
        console.error('Error processing refund:', error);
        return {
          success: false,
          error: 'Failed to process refund'
        };
      }

      return {
        success: true,
        payment_id: payment.payment_id,
        transaction_id: `refund_${Date.now()}`
      };
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        error: 'Refund processing failed'
      };
    }
  }

  // Get payment by ID
  async getPayment(payment_id: string): Promise<PaymentData | null> {
    try {
      const { data: payment, error } = await this.supabase
        .from('Payments')
        .select('*')
        .eq('payment_id', payment_id)
        .single();

      if (error) {
        console.error('Error fetching payment:', error);
        return null;
      }

      return payment;
    } catch (error) {
      console.error('Error fetching payment:', error);
      return null;
    }
  }

  // Get payments for a member
  async getMemberPayments(member_id: string): Promise<PaymentData[]> {
    try {
      const { data: payments, error } = await this.supabase
        .from('Payments')
        .select('*')
        .eq('member_id', member_id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching member payments:', error);
        return [];
      }

      return payments || [];
    } catch (error) {
      console.error('Error fetching member payments:', error);
      return [];
    }
  }
}

export const paymentService = new PaymentService();
