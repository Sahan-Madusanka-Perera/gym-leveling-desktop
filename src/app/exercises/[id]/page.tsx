"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getExerciseById } from "@/services/exercise-service";
import { Exercise } from "../types";
import { Button, LoadingButton } from "@/components/ui/button";
import Image from "next/image";
import { ArrowLeft, Dumbbell, Target, Activity } from "lucide-react";

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExercise = async () => {
      setIsLoading(true);
      try {
        if (!params.id || typeof params.id !== "string") {
          throw new Error("Invalid exercise ID");
        }
        
        const exerciseData = await getExerciseById(params.id);
        setExercise(exerciseData);
      } catch (error) {
        console.error("Failed to load exercise:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [params.id]);

  const goBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center px-4 lg:px-0">
        <LoadingButton isLoading={true} loadingText="Loading exercise details..." />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="w-full px-4 lg:px-0">
        <Button onClick={goBack} variant="outline" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
        </Button>
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-lg font-medium mb-2">Exercise not found</p>
          <p className="text-muted-foreground">The exercise you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 lg:px-0">
      <Button onClick={goBack} variant="outline" className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Exercise Image/GIF */}
        <div className="aspect-square relative overflow-hidden bg-secondary/20 rounded-lg">
          <Image
            src={exercise.gifUrl}
            alt={exercise.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Exercise Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{exercise.name}</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary/10 p-4 rounded-lg flex flex-col items-center text-center">
              <Target className="h-6 w-6 mb-2 text-primary" />
              <h3 className="text-sm font-medium mb-1">Target Muscle</h3>
              <p className="text-sm font-bold">{exercise.target}</p>
            </div>
            
            <div className="bg-secondary/10 p-4 rounded-lg flex flex-col items-center text-center">
              <Activity className="h-6 w-6 mb-2 text-secondary" />
              <h3 className="text-sm font-medium mb-1">Body Part</h3>
              <p className="text-sm font-bold">{exercise.bodyPart}</p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg flex flex-col items-center text-center">
              <Dumbbell className="h-6 w-6 mb-2 text-muted-foreground" />
              <h3 className="text-sm font-medium mb-1">Equipment</h3>
              <p className="text-sm font-bold">{exercise.equipment}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">How to Perform</h2>
            <p className="text-muted-foreground">{exercise.description}</p>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Tips</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Maintain proper form throughout the exercise</li>
              <li>Focus on engaging the {exercise.target} muscles</li>
              <li>Start with lighter weights if you're a beginner</li>
              <li>Include this exercise in your {exercise.bodyPart} workout routine</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 