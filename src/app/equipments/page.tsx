"use client";

import React, { useEffect, useState } from "react";
import { EquipmentUI, equipmentCategories, equipmentStatuses } from "./types";
import { 
  getAllEquipments, 
  filterEquipments, 
  deleteEquipment 
} from "@/services/equipment-service";
import { Input } from "@/components/ui/input";
import { Button, LoadingButton } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Eye, 
  AlertCircle,
  Grid,
  LayoutList
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddEquipmentDialog from "./components/add-equipment-dialog";
import EquipmentDetails from "./components/equipment-details";
import EditEquipmentDialog from "./components/edit-equipment-dialog";

export default function EquipmentsPage() {
  const [allEquipments, setAllEquipments] = useState<EquipmentUI[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<EquipmentUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'grid' | 'table'>('table');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEquipments();
  }, []);

  const loadEquipments = async () => {
    setIsLoading(true);
    try {
      const data = await getAllEquipments();
      setAllEquipments(data);
      setFilteredEquipments(data);
    } catch (error) {
      console.error("Failed to load equipments:", error);
      toast.error("Failed to load equipment data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const applyFilters = async () => {
      try {
        const filtered = await filterEquipments({
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
          search: searchTerm || undefined
        });
        setFilteredEquipments(filtered);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (error) {
        console.error("Failed to filter equipments:", error);
      }
    };

    if (!isLoading) {
      applyFilters();
    }
  }, [selectedCategory, selectedStatus, searchTerm, isLoading]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedStatus(null);
    setSearchTerm("");
  };

  // Pagination
  const totalPages = Math.ceil(filteredEquipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEquipments = filteredEquipments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEquipment = async () => {
    if (!equipmentToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteEquipment(equipmentToDelete);
      if (success) {
        toast.success("Equipment deleted successfully");
        loadEquipments();
      } else {
        toast.error("Failed to delete equipment");
      }
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("An error occurred while deleting the equipment");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setEquipmentToDelete(null);
    }
  };

  const showDeleteConfirmation = (equipmentId: string) => {
    setEquipmentToDelete(equipmentId);
    setDeleteDialogOpen(true);
  };

  const showEquipmentDetails = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    setDetailsDialogOpen(true);
  };

  const refreshEquipments = () => {
    loadEquipments();
  };

  // Helper function to get a color for equipment status
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
    <div className="w-full px-4 lg:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Equipment Management</h1>
        <AddEquipmentDialog onEquipmentAdded={refreshEquipments} />
      </div>

      <div className="bg-secondary/10 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select 
              value={selectedCategory || ""}
              onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {equipmentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select 
              value={selectedStatus || ""}
              onValueChange={(value) => setSelectedStatus(value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {equipmentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 flex items-end">
            <Button 
              onClick={clearFilters} 
              variant="outline" 
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm">
          Showing {filteredEquipments.length} equipment items
        </p>
        <div className="flex gap-2">
          <Button 
            variant={selectedView === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedView('grid')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button 
            variant={selectedView === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedView('table')}
          >
            <LayoutList className="h-4 w-4 mr-2" />
            Table
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingButton isLoading={true} loadingText="Loading equipment..." />
        </div>
      ) : (
        <>
          {filteredEquipments.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-lg">
              <p className="text-lg font-medium mb-2">No equipment found</p>
              <p className="text-muted-foreground">Try changing your filters or adding new equipment</p>
            </div>
          ) : (
            <>
              {/* Table View */}
              {selectedView === 'table' && (
                <Card className="w-full shadow-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentEquipments.map((equipment) => (
                            <TableRow key={equipment.id}>
                              <TableCell className="font-medium">{equipment.name}</TableCell>
                              <TableCell>{equipment.category}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(equipment.status)}>
                                  {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{equipment.quantity}</TableCell>
                              <TableCell>{equipment.location}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => showEquipmentDetails(equipment.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <EditEquipmentDialog
                                    equipmentId={equipment.id}
                                    onEquipmentUpdated={refreshEquipments}
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => showDeleteConfirmation(equipment.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Grid View */}
              {selectedView === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentEquipments.map((equipment) => (
                    <Card key={equipment.id} className="overflow-hidden h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-semibold truncate" title={equipment.name}>
                            {equipment.name}
                          </CardTitle>
                          <Badge className={getStatusColor(equipment.status)}>
                            {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {equipment.category}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2 flex-grow">
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs font-medium">Quantity</p>
                              <p className="text-sm">{equipment.quantity}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Location</p>
                              <p className="text-sm truncate" title={equipment.location}>
                                {equipment.location}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium">Manufacturer</p>
                            <p className="text-sm">
                              {equipment.manufacturer} - {equipment.model}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => showEquipmentDetails(equipment.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <EditEquipmentDialog
                          equipmentId={equipment.id}
                          onEquipmentUpdated={refreshEquipments}
                          variant="text"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => showDeleteConfirmation(equipment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber = totalPages <= 5 
                      ? i + 1 
                      : currentPage > 3 && currentPage < totalPages - 1 
                        ? currentPage - 2 + i 
                        : currentPage >= totalPages - 1 
                          ? totalPages - 4 + i 
                          : i + 1;
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Equipment Details Dialog */}
      {selectedEquipmentId && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Equipment Details</DialogTitle>
            </DialogHeader>
            <EquipmentDetails equipmentId={selectedEquipmentId} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this equipment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-md">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">This will permanently delete the equipment from the system.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEquipment}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 