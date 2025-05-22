"use client";

import React, { useState } from "react";
import { Equipment, equipmentCategories, equipmentStatuses } from "../types";
import { addEquipment } from "@/services/equipment-service";
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
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddEquipmentDialogProps {
  onEquipmentAdded: () => void;
}

export default function AddEquipmentDialog({ onEquipmentAdded }: AddEquipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic-info');
  
  // Form state
  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>({
    name: '',
    description: '',
    category: 'Cardio',
    quantity: 1,
    status: 'available',
    purchaseDate: new Date().toISOString().split('T')[0],
    lastMaintenanceDate: null,
    nextMaintenanceDate: null,
    price: 0,
    manufacturer: '',
    model: '',
    serialNumber: '',
    image: '/images/equipment/default.jpg',
    location: '',
    notes: ''
  });

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
      await addEquipment(formData);
      toast.success("Equipment added successfully");
      setOpen(false);
      resetForm();
      onEquipmentAdded();
    } catch (error) {
      console.error("Failed to add equipment:", error);
      toast.error("Failed to add equipment", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Cardio',
      quantity: 1,
      status: 'available',
      purchaseDate: new Date().toISOString().split('T')[0],
      lastMaintenanceDate: null,
      nextMaintenanceDate: null,
      price: 0,
      manufacturer: '',
      model: '',
      serialNumber: '',
      image: '/images/equipment/default.jpg',
      location: '',
      notes: ''
    });
    setActiveTab('basic-info');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Equipment</DialogTitle>
          <DialogDescription>
            Enter the details for the new gym equipment
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic-info" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Treadmill"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
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
                  <Label htmlFor="category">Category</Label>
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
                  <Label htmlFor="status">Status</Label>
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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
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
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    required
                    placeholder="e.g. LifeFitness"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Platinum Club Series"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number (Optional)</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="e.g. LF-TM-2023-0001"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                    <Input
                      id="price"
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
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
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
                  <Label htmlFor="lastMaintenanceDate">Last Maintenance Date (Optional)</Label>
                  <Input
                    id="lastMaintenanceDate"
                    name="lastMaintenanceDate"
                    type="date"
                    value={formData.lastMaintenanceDate || ''}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nextMaintenanceDate">Next Maintenance Date (Optional)</Label>
                  <Input
                    id="nextMaintenanceDate"
                    name="nextMaintenanceDate"
                    type="date"
                    value={formData.nextMaintenanceDate || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
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
                  {isLoading ? 'Adding Equipment...' : 'Add Equipment'}
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
                {isLoading ? 'Adding Equipment...' : 'Add Equipment'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 