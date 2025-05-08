"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { addMember } from "@/app/actions/member"

// Define schema for member form
const memberFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  birth_date: z.date({
    required_error: "Birth date is required.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender.",
  }),
  phone_number: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  emergency_contact: z.string().min(10, {
    message: "Emergency contact must be at least 10 digits.",
  }).optional(),
  health_info: z.string().optional(),
  subscription_status: z.enum(["active", "inactive", "pending", "expired"], {
    required_error: "Please select a subscription status.",
  }).default("active"),
  activity_level: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select an activity level.",
  }).default("beginner"),
})

type MemberFormValues = z.infer<typeof memberFormSchema>

export function AddMemberDialog() {
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()
  
  // Define default values - memoize to prevent unnecessary re-renders
  const defaultValues = React.useMemo<Partial<MemberFormValues>>(() => ({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    emergency_contact: "",
    health_info: "",
    subscription_status: "active",
    activity_level: "beginner",
    gender: "other"
  }), []);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues,
  })

  // Memoize the form submission function
  const handleSubmit = React.useCallback(async (data: MemberFormValues) => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate submission");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading(`Adding new member: ${data.first_name} ${data.last_name}...`);
    
    try {
      const formData = new FormData()
      formData.append("firstName", data.first_name)
      formData.append("lastName", data.last_name)
      formData.append("email", data.email)
      formData.append("gender", data.gender)
      formData.append("phoneNumber", data.phone_number)
      formData.append("birthDate", data.birth_date.toISOString())
      formData.append("emergencyContact", data.emergency_contact || "")
      formData.append("healthInfo", data.health_info || "")
      formData.append("activityLevel", data.activity_level)
      
      // Setup RLS policies first to ensure we have permission
      try {
        await fetch('/api/setup-rls-policy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (rlsError) {
        console.error("RLS setup error:", rlsError);
        // Continue anyway, as the addMember function will try to set up RLS too
      }
      
      await addMember(formData)
      
      toast.dismiss(toastId);
      toast.success(`${data.first_name} ${data.last_name} added successfully!`);
      
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
        toast.error(`Failed to add member: RLS policy issue. Please click 'Setup RLS Policy' button first.`);
      } else {
        toast.error(`Failed to add member: ${errorMessage}`);
      }
      console.error("Add member error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, router]);
  
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon />
          <span className="hidden lg:inline">Add Member</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new member to the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="member-first-name">First Name</FormLabel>
                    <FormControl>
                      <Input id="member-first-name" placeholder="John" autoComplete="given-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="member-last-name">Last Name</FormLabel>
                    <FormControl>
                      <Input id="member-last-name" placeholder="Doe" autoComplete="family-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span className="text-muted-foreground">Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="member-email">Email</FormLabel>
                    <FormControl>
                      <Input id="member-email" type="email" placeholder="john.doe@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="member-phone">Phone Number</FormLabel>
                    <FormControl>
                      <Input id="member-phone" placeholder="+1234567890" autoComplete="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="emergency_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="member-emergency">Emergency Contact</FormLabel>
                  <FormControl>
                    <Input id="member-emergency" placeholder="+1234567890" autoComplete="off" {...field} />
                  </FormControl>
                  <FormDescription>
                    Contact number in case of emergency
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="health_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="member-health">Health Information</FormLabel>
                  <FormControl>
                    <Textarea
                      id="member-health"
                      placeholder="Any relevant health conditions, allergies, or medical information..."
                      className="resize-none"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Medical conditions, allergies, or other health-related information
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="subscription_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activity_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}