"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingService } from '@/services/booking-service';
import { Member, SessionWithBookings } from '@/types/booking';
import { CreatePaymentRequest } from '@/services/payment-service';
import { PaymentDialog } from './payment-dialog';
import { toast } from 'sonner';
import { Calendar, Users, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BookingDialogProps {
  sessionId: string;
  sessionTitle: string;
  sessionDate?: string;
  children: React.ReactNode;
  onBookingSuccess?: () => void;
}

export function BookingDialog({
  sessionId,
  sessionTitle,
  sessionDate,
  children,
  onBookingSuccess,
}: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [availability, setAvailability] = useState<SessionWithBookings | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, sessionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, availabilityData] = await Promise.all([
        BookingService.getActiveMembers(),
        BookingService.getSessionAvailability(sessionId),
      ]);

      setMembers(membersData);
      setAvailability(availabilityData);
    } catch (error) {
      console.error('Error loading booking data:', error);
      toast.error('Failed to load booking information');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedMemberId) {
      toast.error('Please select a member');
      return;
    }

    if (!availability?.has_availability) {
      toast.error('Session is fully booked');
      return;
    }

    // Check if session requires payment
    if (availability.price && availability.price > 0) {
      setShowPayment(true);
      return;
    }

    // Free session - create booking directly
    try {
      setLoading(true);
      
      await BookingService.createBooking({
        session_id: sessionId,
        member_id: parseInt(selectedMemberId),
        booking_date: sessionDate || new Date().toISOString(),
        notes: notes.trim() || undefined,
      });

      toast.success('Booking created successfully!');
      setOpen(false);
      resetForm();
      onBookingSuccess?.();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: CreatePaymentRequest) => {
    try {
      setPaymentProcessing(true);
      
      await BookingService.createBookingWithPayment({
        session_id: sessionId,
        member_id: parseInt(selectedMemberId),
        booking_date: sessionDate || new Date().toISOString(),
        notes: notes.trim() || undefined,
      }, {
        ...paymentData,
        member_id: parseInt(selectedMemberId)
      });

      toast.success('Booking and payment completed successfully!');
      setShowPayment(false);
      setOpen(false);
      resetForm();
      onBookingSuccess?.();
    } catch (error: any) {
      console.error('Error processing booking with payment:', error);
      toast.error(error.message || 'Failed to process booking and payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedMemberId('');
    setNotes('');
    setShowPayment(false);
    setPaymentProcessing(false);
  };

  const selectedMember = members.find(m => m.member_id.toString() === selectedMemberId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm">{sessionTitle}</h4>
              {availability?.price && availability.price > 0 && (
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <DollarSign className="h-3 w-3" />
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: availability.currency || 'USD'
                  }).format(availability.price)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {availability && (
                <>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{availability.available_spots} spots available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Capacity: {availability.capacity}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Availability Status */}
          {availability && (
            <div className="flex items-center gap-2">
              {availability.has_availability ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Available ({availability.available_spots} spots left)
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Fully Booked
                </Badge>
              )}
            </div>
          )}

          {/* Member Selection */}
          <div className="space-y-2">
            <Label htmlFor="member">Select Member</Label>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a member to book for" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem
                    key={member.member_id}
                    value={member.member_id.toString()}
                  >
                    <div className="flex flex-col">
                      <span>{member.first_name} {member.last_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {member.email || member.phone_number}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Member Info */}
          {selectedMember && (
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm">
                <p className="font-medium">{selectedMember.first_name} {selectedMember.last_name}</p>
                <p className="text-muted-foreground text-xs">
                  {selectedMember.email} • {selectedMember.phone_number}
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {selectedMember.subscription_status}
                </Badge>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any special notes for this booking..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            disabled={loading || !selectedMemberId || !availability?.has_availability}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground mr-2" />
                Creating...
              </>
            ) : availability?.price && availability.price > 0 ? (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Continue to Payment
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Create Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Payment Dialog */}
      {availability && selectedMember && (
        <PaymentDialog
          open={showPayment}
          onOpenChange={setShowPayment}
          sessionTitle={sessionTitle}
          sessionPrice={availability.price || 0}
          sessionCurrency={availability.currency || 'USD'}
          memberId={parseInt(selectedMemberId)}
          memberName={`${selectedMember.first_name} ${selectedMember.last_name}`}
          onPaymentSuccess={handlePaymentSuccess}
          isProcessing={paymentProcessing}
        />
      )}
    </Dialog>
  );
}
