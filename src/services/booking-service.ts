import { createClient } from '@/lib/supabase/client';
import { SessionBooking, BookingFormData, Member, SessionWithBookings } from '@/types/booking';
import { paymentService, CreatePaymentRequest } from './payment-service';
import { mockPaymentService, MockPaymentRequest } from './mock-payment-service';

const supabase = createClient();

export class BookingService {
  // Get all bookings for a session
  static async getSessionBookings(sessionId: string): Promise<SessionBooking[]> {
    const { data, error } = await supabase
      .from('session_bookings')
      .select(`
        *,
        Member:member_id (
          member_id,
          first_name,
          last_name,
          email,
          phone_number
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching session bookings:', error);
      throw new Error('Failed to fetch session bookings');
    }

    return data || [];
  }

  // Get session availability info
  static async getSessionAvailability(sessionId: string): Promise<SessionWithBookings | null> {
    const { data, error } = await supabase
      .from('session_availability')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching session availability:', error);
      throw new Error('Failed to fetch session availability');
    }

    return data;
  }

  // Get all active members for booking dropdown
  static async getActiveMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('Member')
      .select('member_id, first_name, last_name, email, phone_number, subscription_status')
      .eq('subscription_status', 'active')
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching members:', error);
      throw new Error('Failed to fetch members');
    }

    return data || [];
  }

  // Create a new booking with payment
  static async createBookingWithPayment(
    bookingData: BookingFormData, 
    paymentData: CreatePaymentRequest
  ): Promise<SessionBooking> {
    console.log('Creating booking with payment:', { bookingData, paymentData });
    
    // First check availability
    const availability = await this.getSessionAvailability(bookingData.session_id);
    if (!availability || !availability.has_availability) {
      throw new Error('Session is fully booked');
    }

    // Check if member already has a booking for this session
    const { data: existingBooking } = await supabase
      .from('session_bookings')
      .select('id')
      .eq('session_id', bookingData.session_id)
      .eq('member_id', bookingData.member_id)
      .neq('status', 'cancelled')
      .single();

    if (existingBooking) {
      throw new Error('Member already has a booking for this session');
    }

    console.log('Processing payment...');
    
    // Try real payment service first, fallback to mock if it fails
    let paymentResult;
    let paymentId: number | string | undefined;
    
    try {
      // Try real payment service
      paymentResult = await paymentService.processPayment(paymentData);
      paymentId = paymentResult.payment_id;
    } catch (error) {
      console.warn('Real payment service failed, using mock service:', error);
      
      // Fallback to mock payment service
      const mockPaymentData: MockPaymentRequest = {
        member_id: paymentData.member_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method
      };
      
      paymentResult = await mockPaymentService.processPayment(mockPaymentData);
      paymentId = paymentResult.payment_id;
    }
    
    console.log('Payment result:', paymentResult);
    
    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Payment processing failed');
    }

    // Create booking with payment reference
    const { data, error } = await supabase
      .from('session_bookings')
      .insert([{
        session_id: bookingData.session_id,
        member_id: bookingData.member_id,
        booking_date: bookingData.booking_date,
        notes: bookingData.notes,
        status: 'confirmed',
        payment_id: typeof paymentId === 'number' ? paymentId : null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }

    return data;
  }

  // Create a new booking (legacy method for admin bookings without payment)
  static async createBooking(bookingData: BookingFormData): Promise<SessionBooking> {
    // First check availability
    const availability = await this.getSessionAvailability(bookingData.session_id);
    if (!availability || !availability.has_availability) {
      throw new Error('Session is fully booked');
    }

    // Check if member already has a booking for this session
    const { data: existingBooking } = await supabase
      .from('session_bookings')
      .select('id')
      .eq('session_id', bookingData.session_id)
      .eq('member_id', bookingData.member_id)
      .neq('status', 'cancelled')
      .single();

    if (existingBooking) {
      throw new Error('Member already has a booking for this session');
    }

    const { data, error } = await supabase
      .from('session_bookings')
      .insert([{
        session_id: bookingData.session_id,
        member_id: bookingData.member_id,
        booking_date: bookingData.booking_date,
        notes: bookingData.notes,
        status: 'confirmed'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }

    return data;
  }

  // Cancel a booking
  static async cancelBooking(bookingId: string): Promise<void> {
    const { error } = await supabase
      .from('session_bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) {
      console.error('Error cancelling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  }

  // Cancel a booking with refund
  static async cancelBookingWithRefund(bookingId: string): Promise<void> {
    // First get the booking with payment info
    const { data: booking, error: fetchError } = await supabase
      .from('session_bookings')
      .select('*, payment_id')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      console.error('Error fetching booking:', fetchError);
      throw new Error('Failed to fetch booking details');
    }

    // Process refund if there's a payment
    if (booking.payment_id) {
      const refundResult = await paymentService.processRefund(booking.payment_id);
      if (!refundResult.success) {
        throw new Error(refundResult.error || 'Refund processing failed');
      }
    }

    // Update booking status
    const { error } = await supabase
      .from('session_bookings')
      .update({ 
        status: booking.payment_id ? 'refunded' : 'cancelled', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error cancelling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  }

  // Update booking status
  static async updateBookingStatus(
    bookingId: string, 
    status: SessionBooking['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('session_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking status:', error);
      throw new Error('Failed to update booking status');
    }
  }

  // Get bookings for a specific member
  static async getMemberBookings(memberId: number): Promise<SessionBooking[]> {
    const { data, error } = await supabase
      .from('session_bookings')
      .select(`
        *,
        sessions (
          id,
          title,
          description,
          duration,
          day_of_week,
          start_time,
          end_time
        )
      `)
      .eq('member_id', memberId)
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching member bookings:', error);
      throw new Error('Failed to fetch member bookings');
    }

    return data || [];
  }
}
