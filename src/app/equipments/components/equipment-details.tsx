"use client";

import React, { useEffect, useState } from "react";
import { Equipment } from "../types";
import { getEquipmentById } from "@/services/equipment-service";
import { LoadingButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, Clipboard, Wrench, DollarSign, MapPin } from "lucide-react";

interface EquipmentDetailsProps {
  equipmentId: string;
}

export default function EquipmentDetails({ equipmentId }: EquipmentDetailsProps) {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const data = await getEquipmentById(equipmentId);
        setEquipment(data);
      } catch (error) {
        console.error("Failed to load equipment details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (equipmentId) {
      fetchEquipment();
    }
  }, [equipmentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingButton isLoading={true} loadingText="Loading details..." />
      </div>
    );
  }

  if (!equipment) {
    return <div className="py-8 text-center">Equipment not found</div>;
  }

  // Helper function to format dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString();
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'out-of-order': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{equipment.name}</h2>
          <p className="text-muted-foreground">{equipment.category}</p>
        </div>
        <Badge className={getStatusColor(equipment.status)}>
          {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
        </Badge>
      </div>

      <p className="text-sm">{equipment.description}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Quantity</p>
          <p>{equipment.quantity}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Location</p>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{equipment.location}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Equipment Specifications</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Manufacturer</p>
            <p>{equipment.manufacturer}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Model</p>
            <p>{equipment.model}</p>
          </div>
          {equipment.serialNumber && (
            <div className="space-y-1 col-span-2">
              <p className="text-xs font-medium text-muted-foreground">Serial Number</p>
              <div className="flex items-center gap-1">
                <Clipboard className="h-4 w-4" />
                <span>{equipment.serialNumber}</span>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Purchase Date</p>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDate(equipment.purchaseDate)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Price</p>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>${equipment.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Maintenance Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Last Maintenance</p>
            <div className="flex items-center gap-1">
              <Wrench className="h-4 w-4" />
              <span>{formatDate(equipment.lastMaintenanceDate)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Next Maintenance</p>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(equipment.nextMaintenanceDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {equipment.notes && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Notes</h3>
            <p className="text-sm">{equipment.notes}</p>
          </div>
        </>
      )}
    </div>
  );
} 