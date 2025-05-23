"use client";

import React, { useEffect, useState } from "react";
import { Exercise } from "./types";
import { 
  getExercises, 
  getUniqueBodyParts, 
  getUniqueEquipment, 
  getUniqueTargets,
  filterExercises
} from "@/services/exercise-service";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button, LoadingButton } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');

  // Filter states
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);
      try {
        const data = await getExercises();
        setExercises(data);
        setFilteredExercises(data);
        setBodyParts(getUniqueBodyParts(data));
        setEquipment(getUniqueEquipment(data));
        setTargets(getUniqueTargets(data));
      } catch (error) {
        console.error("Failed to load exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, []);

  useEffect(() => {
    // Apply filters when any filter criteria changes
    const filtered = filterExercises(exercises, {
      bodyPart: selectedBodyPart || undefined,
      equipment: selectedEquipment || undefined,
      target: selectedTarget || undefined,
      searchTerm: searchTerm || undefined
    });
    setFilteredExercises(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedBodyPart, selectedEquipment, selectedTarget, searchTerm, exercises]);

  const clearFilters = () => {
    setSelectedBodyPart(null);
    setSelectedEquipment(null);
    setSelectedTarget(null);
    setSearchTerm("");
  };

  // Pagination
  const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExercises = filteredExercises.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full px-4 lg:px-0">
      <h1 className="text-3xl font-bold mb-8">Exercise Library</h1>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingButton isLoading={true} loadingText="Loading exercises..." />
        </div>
      ) : (
        <>
          {/* Filters Section */}
          <div className="bg-secondary/10 rounded-lg p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Body Part</label>
                <Select 
                  value={selectedBodyPart || undefined} 
                  onValueChange={setSelectedBodyPart}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body part" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_body_parts">All body parts</SelectItem>
                    {bodyParts.map((part) => (
                      <SelectItem key={part} value={part}>
                        {part.charAt(0).toUpperCase() + part.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Equipment</label>
                <Select 
                  value={selectedEquipment || undefined}
                  onValueChange={setSelectedEquipment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_equipment">All equipment</SelectItem>
                    {equipment.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Muscle</label>
                <Select 
                  value={selectedTarget || undefined}
                  onValueChange={setSelectedTarget}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_targets">All targets</SelectItem>
                    {targets.map((target) => (
                      <SelectItem key={target} value={target}>
                        {target.charAt(0).toUpperCase() + target.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
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

          {/* View Toggle */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm">
              Showing {filteredExercises.length} exercises
            </p>
            <div className="flex gap-2">
              <Button 
                variant={selectedView === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedView('grid')}
              >
                Grid View
              </Button>
              <Button 
                variant={selectedView === 'list' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedView('list')}
              >
                List View
              </Button>
            </div>
          </div>

          {/* No Results */}
          {filteredExercises.length === 0 && (
            <div className="text-center py-16 border border-dashed rounded-lg">
              <p className="text-lg font-medium mb-2">No exercises found</p>
              <p className="text-muted-foreground">Try changing your filters or search term</p>
            </div>
          )}

          {/* Grid View */}
          {selectedView === 'grid' && filteredExercises.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentExercises.map((exercise) => (
                <Card key={exercise.id} className="overflow-hidden h-full flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-secondary/20">
                    <Image
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      fill
                      className="object-cover"
                      unoptimized // For GIFs to work properly
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold truncate" title={exercise.name}>
                      {exercise.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                        {exercise.bodyPart}
                      </span>
                      <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-md text-xs font-medium">
                        {exercise.target}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium">
                        {exercise.equipment}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {exercise.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/exercises/${exercise.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {selectedView === 'list' && filteredExercises.length > 0 && (
            <div className="space-y-4">
              {currentExercises.map((exercise) => (
                <Card key={exercise.id}>
                  <div className="flex flex-col md:flex-row gap-4 p-4">
                    <div className="w-full md:w-24 h-24 relative overflow-hidden bg-secondary/20 shrink-0 rounded-md">
                      <Image
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        fill
                        className="object-cover"
                        unoptimized // For GIFs to work properly
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-2">{exercise.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                          {exercise.bodyPart}
                        </span>
                        <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-md text-xs font-medium">
                          {exercise.target}
                        </span>
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium">
                          {exercise.equipment}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {exercise.description}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center mt-4 md:mt-0">
                      <Link href={`/exercises/${exercise.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredExercises.length > 0 && (
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
    </div>
  );
}
