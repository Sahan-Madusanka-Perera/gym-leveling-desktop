"use client";

import React, { useState, useEffect } from "react";
import { EquipmentUI, equipmentCategories, equipmentStatuses } from "../types";
import { getEquipmentById, updateEquipment } from "@/services/equipment-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit } from "lucide-react";

interface EditEquipmentDialogProps {
  equipmentId: string;
  onEquipmentUpdated: () => void;
  trigger?: React.ReactNode;
  variant?: 'icon' | 'text';
}

export default function EditEquipmentDialog({ 
  equipmentId, 
  onEquipmentUpdated, 
  trigger,
  variant = 'icon'
}: EditEquipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('basic-info');
  
  // Form state
  const [formData, setFormData] = useState<Omit<EquipmentUI, 'id'>>({
    name: '',
    description: '',
    category: 'Cardio',
    quantity: 1,
    status: 'available',
    purchaseDate: '',
    lastMaintenanceDate: null,
    nextMaintenanceDate: null,
    price: 0,
    manufacturer: '',
    model: '',
    serialNumber: '',
    image: '',
    location: '',
    notes: ''
  });

  // Load equipment data when dialog opens
  useEffect(() => {
    if (open && equipmentId) {
      loadEquipmentData();
    }
  }, [open, equipmentId]);

  const loadEquipmentData = async () => {
    setIsLoadingData(true);
    try {
      const equipment = await getEquipmentById(equipmentId);
      if (equipment) {
        setFormData({
          name: equipment.name,
          description: equipment.description,
          category: equipment.category,
          quantity: equipment.quantity,
          status: equipment.status,
          purchaseDate: equipment.purchaseDate,
          lastMaintenanceDate: equipment.lastMaintenanceDate,
          nextMaintenanceDate: equipment.nextMaintenanceDate,
          price: equipment.price,
          manufacturer: equipment.manufacturer,
          model: equipment.model,
          serialNumber: equipment.serialNumber,
          image: equipment.image,
          location: equipment.location,
          notes: equipment.notes
        });
      }
    } catch (error) {
      console.error("Failed to load equipment data:", error);
      toast.error("Failed to load equipment data");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'quantity') {
      // Handle numeric inputs
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updated = await updateEquipment(equipmentId, formData);
      if (updated) {
        toast.success("Equipment updated successfully");
        setOpen(false);
        onEquipmentUpdated();
      } else {
        toast.error("Failed to update equipment");
      }
    } catch (error) {
      console.error("Failed to update equipment:", error);
      toast.error("Failed to update equipment", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setActiveTab('basic-info');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          variant === 'text' ? (
            <Button variant="outline" size="sm" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
          <DialogDescription>
            Update the equipment details
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingData ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading equipment data...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic-info" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Equipment Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Treadmill"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Provide a detailed description of this equipment"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => handleSelectChange('status', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-quantity">Quantity</Label>
                    <Input
                      id="edit-quantity"
                      name="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min={1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Cardio Area - Main Floor"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="button" onClick={() => setActiveTab('specifications')}>
                    Next
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-manufacturer">Manufacturer</Label>
                    <Input
                      id="edit-manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      required
                      placeholder="e.g. LifeFitness"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-model">Model</Label>
                    <Input
                      id="edit-model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Platinum Club Series"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-serialNumber">Serial Number (Optional)</Label>
                  <Input
                    id="edit-serialNumber"
                    name="serialNumber"
                    value={formData.serialNumber || ''}
                    onChange={handleChange}
                    placeholder="e.g. LF-TM-2023-0001"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price</Label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                      <Input
                        id="edit-price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min={0}
                        step={0.01}
                        className="pl-6"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-purchaseDate">Purchase Date</Label>
                    <Input
                      id="edit-purchaseDate"
                      name="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('basic-info')}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab('maintenance')}>
                    Next
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="maintenance" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastMaintenanceDate">Last Maintenance Date (Optional)</Label>
                    <Input
                      id="edit-lastMaintenanceDate"
                      name="lastMaintenanceDate"
                      type="date"
                      value={formData.lastMaintenanceDate || ''}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-nextMaintenanceDate">Next Maintenance Date (Optional)</Label>
                    <Input
                      id="edit-nextMaintenanceDate"
                      name="nextMaintenanceDate"
                      type="date"
                      value={formData.nextMaintenanceDate || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes (Optional)</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    placeholder="Any additional notes or instructions"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('specifications')}>
                    Previous
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating Equipment...' : 'Update Equipment'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-4 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {activeTab === 'maintenance' && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating Equipment...' : 'Update Equipment'}
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
