export interface SessionBooking {
  id: string;
  session_id: string;
  member_id: number;
  booking_date: string;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'refunded';
  notes?: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionWithBookings {
  id: string;
  title: string;
  capacity: number;
  booked_count: number;
  available_spots: number;
  has_availability: boolean;
  price?: number;
  currency?: string;
}

export interface BookingFormData {
  session_id: string;
  member_id: number;
  booking_date: string;
  notes?: string;
}

export interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number: string;
  subscription_status: string;
}
