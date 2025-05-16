"use client";

import React, { useState } from "react";
import { LoadingButton } from "@/components/ui/button";

export default function LoadingButtonDemo() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate an async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-bold">Loading Button Examples</h1>
      
      {/* Basic loading button */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Basic Loading Button</h2>
        <LoadingButton 
          isLoading={isLoading} 
          onClick={handleSubmit}
        >
          Submit Form
        </LoadingButton>
      </div>

      {/* Loading button with text change */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">With Loading Text</h2>
        <LoadingButton 
          isLoading={isLoading} 
          loadingText="Processing..." 
          onClick={handleSubmit}
        >
          Save Changes
        </LoadingButton>
      </div>

      {/* Different variants */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Different Variants</h2>
        <div className="flex flex-wrap gap-2">
          <LoadingButton 
            variant="default" 
            isLoading={isLoading} 
            onClick={handleSubmit}
          >
            Default
          </LoadingButton>
          <LoadingButton 
            variant="destructive" 
            isLoading={isLoading} 
            onClick={handleSubmit}
          >
            Destructive
          </LoadingButton>
          <LoadingButton 
            variant="outline" 
            isLoading={isLoading} 
            onClick={handleSubmit}
          >
            Outline
          </LoadingButton>
          <LoadingButton 
            variant="secondary" 
            isLoading={isLoading} 
            onClick={handleSubmit}
          >
            Secondary
          </LoadingButton>
        </div>
      </div>

      {/* Different sizes */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Different Sizes</h2>
        <div className="flex flex-wrap items-center gap-2">
          <LoadingButton 
            size="sm" 
            isLoading={isLoading} 
            onClick={handleSubmit}
          >
            Small
          </LoadingButton>
          <LoadingButton 
            size="default" 
            isLoading={isLoading} 
            onClick={handleSubmit}
          >
            Default
          </LoadingButton>
          <LoadingButton 
            size="lg" 
            isLoading={isLoading} 
            onClick={handleSubmit}
          >
            Large
          </LoadingButton>
        </div>
      </div>
    </div>
  );
} 