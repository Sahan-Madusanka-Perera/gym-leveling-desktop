"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
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
import { addTrainer } from "@/app/actions/trainer"
import { type Trainer, trainerSchema } from "@/types/trainer"

type TrainerFormData = Omit<Trainer, "id" | "trainer_id">

export function AddTrainerDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // Define default values with useMemo to prevent unnecessary re-renders
  const defaultValues = React.useMemo(() => ({
    name: "",
    specialization: "",
    contact: "",
  }), []);
  
  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema.omit({ id: true, trainer_id: true })),
    defaultValues,
  })
  
  // Memoize the dialog open change handler
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    // When closing the dialog, reset the form with a delay to avoid React update loops
    if (!newOpen && open) {
      setOpen(false);
      setTimeout(() => {
        form.reset(defaultValues);
      }, 100);
    } else {
      setOpen(newOpen);
    }
  }, [open, form, defaultValues]);

  // Memoize the submit handler
  const handleSubmit = React.useCallback(async (data: TrainerFormData) => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate submission");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading(`Adding new trainer: ${data.name}...`);
    
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("specialization", data.specialization || "")
      formData.append("contact", data.contact || "")
      
      // Setup RLS policies first to ensure we have permission
      try {
        await fetch('/api/setup-rls-policy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (rlsError) {
        console.error("RLS setup error:", rlsError);
        // Continue anyway, as the addTrainer function will try to set up RLS too
      }
      
      await addTrainer(formData)
      
      toast.dismiss(toastId);
      toast.success(`${data.name} added successfully!`);
      
      // Close dialog first
      setOpen(false);
      
      // Then refresh the page after a slight delay
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      toast.dismiss(toastId);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("RLS policy") || errorMessage.includes("Permission denied")) {
        toast.error(`Failed to add trainer: RLS policy issue. Please click 'Setup RLS Policy' button first.`);
      } else {
        toast.error(`Failed to add trainer: ${errorMessage}`);
      }
      console.error("Add trainer error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, router]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline">Add Trainer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Trainer</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new trainer to the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="add-trainer-name">Name</FormLabel>
                    <FormControl>
                      <Input id="add-trainer-name" placeholder="John Doe" autoComplete="name" {...field} />
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
                    <FormLabel htmlFor="add-trainer-specialization">Specialization</FormLabel>
                    <FormControl>
                      <Input id="add-trainer-specialization" placeholder="e.g., Strength Training, Yoga, etc." autoComplete="off" {...field} value={field.value || ""} />
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
                  <FormLabel htmlFor="add-trainer-contact">Contact Information</FormLabel>
                  <FormControl>
                    <Input id="add-trainer-contact" placeholder="Phone number or email" autoComplete="tel" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Trainer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 