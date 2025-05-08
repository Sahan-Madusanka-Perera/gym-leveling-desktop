"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { addTrainer, updateTrainer } from "@/app/actions/trainer"
import { type Trainer, type TrainerWithTempId, trainerSchema } from "@/types/trainer"

type TrainerFormData = Omit<Trainer, "id">

interface EditTrainerDialogProps {
  trainer: TrainerWithTempId
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTrainerDialog({ trainer, open, onOpenChange }: EditTrainerDialogProps) {
  console.log("DIALOG RENDER: EditTrainerDialog rendered", { 
    trainer, 
    open, 
    trainerIdType: typeof trainer.id,
    trainerId: trainer.id 
  });
  
  const router = useRouter()
  
  console.log("Rendering EditTrainerDialog with trainer:", trainer);
  
  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema.omit({ id: true })),
    defaultValues: {
      name: trainer.name,
      specialization: trainer.specialization || "",
      contact: trainer.contact || "",
    },
  })
  
  // Log form state for debugging
  const formState = form.formState;
  console.log("Form state:", { 
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    errors: formState.errors
  });

  async function onSubmit(data: TrainerFormData) {
    console.log("Edit trainer form submitted with data:", data);
    
    try {
      console.log("FORM SUBMIT: Creating FormData object");
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("specialization", data.specialization || "")
      formData.append("contact", data.contact || "")

      console.log("FORM SUBMIT: FormData created with entries:", Array.from(formData.entries()));
      console.log("FORM SUBMIT: Trainer object details:", trainer);

      // Determine the correct ID to use - prefer trainer_id over id
      let trainerId: number | undefined;

      // More robust ID detection
      // First check if trainer_id exists as a property and is a number
      if ('trainer_id' in trainer && typeof trainer['trainer_id'] === 'number') {
        trainerId = trainer['trainer_id'];
        console.log("FORM SUBMIT: Using trainer_id from object:", trainerId);
      } 
      // Check for trainer_id as a string that can be parsed to a number
      else if ('trainer_id' in trainer && typeof trainer['trainer_id'] === 'string') {
        const parsed = parseInt(trainer['trainer_id'], 10);
        if (!isNaN(parsed)) {
          trainerId = parsed;
          console.log("FORM SUBMIT: Using parsed numeric trainer_id:", trainerId);
        }
      }
      // Otherwise, fall back to id if it's a number
      else if (typeof trainer.id === 'number') {
        trainerId = trainer.id;
        console.log("FORM SUBMIT: Using id as fallback:", trainerId);
      } 
      // Try parsing the id as a number if it's a string
      else if (typeof trainer.id === 'string' && !trainer.id.startsWith('temp-')) {
        const parsed = parseInt(trainer.id, 10);
        if (!isNaN(parsed)) {
          trainerId = parsed;
          console.log("FORM SUBMIT: Using parsed numeric id:", trainerId);
        }
      }

      // If no valid ID was found
      if (trainerId === undefined || isNaN(trainerId) || trainerId <= 0) {
        console.log("FORM SUBMIT: No valid trainer ID found");
        throw new Error("Cannot update: No valid trainer ID available. If this is a new trainer, please save it first.");
      }
      
      // Log the exact ID being used
      console.log("FORM SUBMIT: Using trainerId for update:", trainerId);
      
      // Update with the correct ID
      try {
        console.log("FORM SUBMIT: Calling updateTrainer with ID:", trainerId);
        
        // Force a short delay to ensure any previous operations are complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await updateTrainer(trainerId, formData);
        console.log("FORM SUBMIT: Server action returned:", result);
        
        if (!result) {
          console.error("FORM SUBMIT: Server action returned null or undefined result");
          throw new Error("Server returned no data");
        }
        
        return result;
      } catch (actionError) {
        console.error("FORM SUBMIT: Server action threw error:", actionError);
        throw actionError;
      }
    } catch (error) {
      console.error("FORM SUBMIT: Error in form submission:", error);
      throw error;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trainer</DialogTitle>
          <DialogDescription>
            Update trainer information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              // Prevent the default form submission
              e.preventDefault();
              
              // Get the form values directly like we do in direct submit
              const values = form.getValues();
              console.log("FORM SUBMIT: Form values:", values);
              
              // Call onSubmit directly with the values, matching the direct submit approach
              try {
                // Show pending toast
                const toastId = toast.loading("Updating trainer...");
                
                onSubmit(values)
                  .then((updatedTrainer) => {
                    console.log("FORM SUBMIT: Trainer updated successfully:", updatedTrainer);
                    toast.dismiss(toastId);
                    toast.success("Trainer updated successfully");
                    onOpenChange(false);
                    router.refresh();
                  })
                  .catch(error => {
                    console.error("FORM SUBMIT: Error in onSubmit handler:", error);
                    toast.dismiss(toastId);
                    
                    // Check for RLS-related errors
                    const errorMessage = error.message || "Failed to update trainer";
                    if (errorMessage.includes("RLS policy") || errorMessage.includes("Permission denied") || errorMessage.includes("PGRST100")) {
                      // This is an RLS-related error
                      toast.error("Permission denied due to RLS policies");
                      
                      // Show a more detailed error with guidance
                      setTimeout(() => {
                        alert(
                          "Row Level Security (RLS) Policy Error\n\n" +
                          "You don't have permission to update this trainer record. This is likely because:\n\n" +
                          "1. You are not authenticated, or\n" +
                          "2. The necessary RLS policies are not set up\n\n" +
                          "Recommended actions:\n" +
                          "• Make sure you are logged in\n" +
                          "• Contact your administrator to set up proper RLS policies\n\n" +
                          "Technical details:\n" +
                          errorMessage
                        );
                      }, 500);
                    } else {
                      toast.error(errorMessage);
                    }
                  });
              } catch (error) {
                console.error("FORM SUBMIT: Unexpected error during form submission:", error);
                toast.error("Unexpected error occurred");
              }
            }} 
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="trainer-name">Name</FormLabel>
                    <FormControl>
                      <Input 
                        id="trainer-name"
                        placeholder="John Doe" 
                        autoComplete="name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="trainer-specialization">Specialization</FormLabel>
                    <FormControl>
                      <Input 
                        id="trainer-specialization"
                        placeholder="e.g., Strength Training, Yoga, etc." 
                        autoComplete="off"
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="trainer-contact">Contact Information</FormLabel>
                  <FormControl>
                    <Input 
                      id="trainer-contact"
                      placeholder="Phone number or email" 
                      autoComplete="tel"
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 