"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, DollarSign } from "lucide-react";
import { CreatePaymentRequest } from "@/services/payment-service";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionTitle: string;
  sessionPrice: number;
  sessionCurrency: string;
  memberId: number;
  memberName: string;
  onPaymentSuccess: (paymentData: CreatePaymentRequest) => void;
  isProcessing?: boolean;
}

export function PaymentDialog({
  open,
  onOpenChange,
  sessionTitle,
  sessionPrice,
  sessionCurrency,
  memberId,
  memberName,
  onPaymentSuccess,
  isProcessing = false,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [cardNumber, setCardNumber] = useState("4111111111111111"); // Demo card
  const [expiryDate, setExpiryDate] = useState("12/25");
  const [cvv, setCvv] = useState("123");
  const [cardholderName, setCardholderName] = useState("");

  const handlePayment = () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    const paymentData: CreatePaymentRequest = {
      member_id: memberId,
      amount: sessionPrice,
      payment_method: paymentMethod
    };

    onPaymentSuccess(paymentData);
  };

  const formatPrice = (amount: number, currency: string) => {
    // Handle LKR formatting
    if (currency.toUpperCase() === 'LKR') {
      return `LKR ${amount.toLocaleString('en-LK', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    }
    
    // Default formatting for other currencies
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            Complete your booking payment for {sessionTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Session:</span>
                <span className="font-medium">{sessionTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Member:</span>
                <span className="font-medium">{memberName}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-lg">{formatPrice(sessionPrice, sessionCurrency)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <div className="space-y-4">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer (Demo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Details (only show for card payments) */}
          {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          {/* Demo Notice */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Demo Mode</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              This is a demo payment system. No real money will be charged. 
              Card number 4111111111111111 is provided for testing.
            </p>
          </div>

          {/* Payment Button */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              className="flex-1"
              disabled={!paymentMethod || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pay {formatPrice(sessionPrice, sessionCurrency)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
