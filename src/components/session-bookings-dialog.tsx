"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingService } from '@/services/booking-service';
import { SessionBooking } from '@/types/booking';
import { toast } from 'sonner';
import { Users, Calendar, Phone, Mail, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SessionBookingsProps {
  sessionId: string;
  sessionTitle: string;
  children: React.ReactNode;
}

export function SessionBookingsDialog({
  sessionId,
  sessionTitle,
  children,
}: SessionBookingsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadBookings();
    }
  }, [open, sessionId]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await BookingService.getSessionBookings(sessionId);
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: SessionBooking['status']) => {
    try {
      await BookingService.updateBookingStatus(bookingId, newStatus);
      toast.success('Booking status updated');
      loadBookings(); // Refresh the list
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCancelWithRefund = async (bookingId: string) => {
    try {
      setLoading(true);
      await BookingService.cancelBookingWithRefund(bookingId);
      toast.success('Booking cancelled and refund processed');
      loadBookings();
    } catch (error: any) {
      console.error('Error cancelling booking with refund:', error);
      toast.error(error.message || 'Failed to cancel booking and process refund');
    } finally {
      setLoading(false);
    }
  };

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalBookings = bookings.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Bookings - {sessionTitle}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">
              {confirmedBookings.length} Confirmed
            </Badge>
            <Badge variant="outline">
              {totalBookings} Total Bookings
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading bookings...</div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No bookings yet</h3>
              <p className="text-sm text-muted-foreground">
                This session doesn't have any bookings yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booked On</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {booking.Member?.first_name} {booking.Member?.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {booking.member_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {booking.Member?.email && (
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3" />
                            <span>{booking.Member.email}</span>
                          </div>
                        )}
                        {booking.Member?.phone_number && (
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3" />
                            <span>{booking.Member.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(booking.status)}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(booking.created_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-[150px] truncate" title={booking.notes}>
                        {booking.notes || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            disabled={booking.status === 'confirmed'}
                          >
                            Mark as Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            disabled={booking.status === 'completed'}
                          >
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(booking.id, 'no_show')}
                            disabled={booking.status === 'no_show'}
                          >
                            Mark as No Show
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            disabled={booking.status === 'cancelled' || booking.status === 'refunded'}
                            className="text-red-600"
                          >
                            Cancel Booking
                          </DropdownMenuItem>
                          {/* Show refund option for bookings with payments */}
                          {booking.payment_id && booking.status === 'confirmed' && (
                            <DropdownMenuItem
                              onClick={() => handleCancelWithRefund(booking.id)}
                              disabled={loading}
                              className="text-purple-600"
                            >
                              Cancel & Refund
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
