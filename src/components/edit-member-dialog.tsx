"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { updateMember } from "@/app/actions/member"

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
  activity_level: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select an activity level.",
  }).default("beginner"),
})

type MemberFormValues = z.infer<typeof memberFormSchema>

// Define the interface for the member object
interface MemberWithId {
  member_id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  email: string | null;
  gender: string;
  phone_number: string;
  emergency_contact: string | null;
  health_info: string | null;
  activity_level: string;
  [key: string]: any; // For any additional properties
}

interface EditMemberDialogProps {
  member: MemberWithId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
  console.log("DIALOG RENDER: EditMemberDialog rendered", { 
    member, 
    open, 
    memberIdType: typeof member.member_id,
    memberId: member.member_id 
  });
  
  const router = useRouter()
  
  // Parse the birth date string to a Date object
  const birthDate = member.birth_date ? new Date(member.birth_date) : new Date();
  
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      first_name: member.first_name,
      last_name: member.last_name,
      birth_date: birthDate,
      email: member.email || "",
      gender: (member.gender?.toLowerCase() as "male" | "female" | "other") || "other",
      phone_number: member.phone_number || "",
      emergency_contact: member.emergency_contact || "",
      health_info: member.health_info || "",
      activity_level: (member.activity_level?.toLowerCase() as "beginner" | "intermediate" | "advanced") || "beginner",
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

  async function onSubmit(data: MemberFormValues) {
    console.log("Edit member form submitted with data:", data);
    
    try {
      console.log("FORM SUBMIT: Creating FormData object");
      const formData = new FormData()
      formData.append("firstName", data.first_name);
      formData.append("lastName", data.last_name);
      formData.append("email", data.email);
      formData.append("gender", data.gender);
      formData.append("phoneNumber", data.phone_number);
      formData.append("birthDate", data.birth_date.toISOString());
      formData.append("emergencyContact", data.emergency_contact || "");
      formData.append("healthInfo", data.health_info || "");
      formData.append("activityLevel", data.activity_level);

      console.log("FORM SUBMIT: FormData created with entries:", Array.from(formData.entries()));
      console.log("FORM SUBMIT: Member object details:", member);

      // Determine the correct ID to use
      let memberId: number | undefined;

      // More robust ID detection
      // First check if member_id exists as a property and is a number
      if ('member_id' in member && typeof member.member_id === 'number') {
        memberId = member.member_id;
        console.log("FORM SUBMIT: Using member_id from object:", memberId);
      } 
      // Check for member_id as a string that can be parsed to a number
      else if ('member_id' in member && typeof member.member_id === 'string') {
        const parsed = parseInt(member.member_id, 10);
        if (!isNaN(parsed)) {
          memberId = parsed;
          console.log("FORM SUBMIT: Using parsed numeric member_id:", memberId);
        }
      }
      // Otherwise, fall back to id if it's a number
      else if ('id' in member && typeof member.id === 'number') {
        memberId = member.id;
        console.log("FORM SUBMIT: Using id as fallback:", memberId);
      } 
      // Try parsing the id as a number if it's a string
      else if ('id' in member && typeof member.id === 'string') {
        const parsed = parseInt(member.id, 10);
        if (!isNaN(parsed)) {
          memberId = parsed;
          console.log("FORM SUBMIT: Using parsed numeric id:", memberId);
        }
      }

      // If no valid ID was found
      if (memberId === undefined || isNaN(memberId) || memberId <= 0) {
        console.log("FORM SUBMIT: No valid member ID found");
        throw new Error("Cannot update: No valid member ID available. If this is a new member, please save it first.");
      }
      
      // Log the exact ID being used
      console.log("FORM SUBMIT: Using memberId for update:", memberId);
      
      // Update with the correct ID
      try {
        console.log("FORM SUBMIT: Calling updateMember with ID:", memberId);
        
        // Force a short delay to ensure any previous operations are complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await updateMember(memberId, formData);
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
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update member information. Click save when you're done.
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
                const toastId = toast.loading("Updating member...");
                
                onSubmit(values)
                  .then((updatedMember) => {
                    console.log("FORM SUBMIT: Member updated successfully:", updatedMember);
                    toast.dismiss(toastId);
                    toast.success("Member updated successfully");
                    onOpenChange(false);
                    router.refresh();
                  })
                  .catch(error => {
                    console.error("FORM SUBMIT: Error in onSubmit handler:", error);
                    toast.dismiss(toastId);
                    
                    // Check for RLS-related errors
                    const errorMessage = error.message || "Failed to update member";
                    if (errorMessage.includes("RLS policy") || errorMessage.includes("Permission denied") || errorMessage.includes("PGRST100")) {
                      // This is an RLS-related error
                      toast.error("Permission denied due to RLS policies");
                      
                      // Show a more detailed error with guidance
                      setTimeout(() => {
                        alert(
                          "Row Level Security (RLS) Policy Error\n\n" +
                          "You don't have permission to update this member record. This is likely because:\n\n" +
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
                    <FormLabel>Birth Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={
                              !field.value ? "text-muted-foreground" : ""
                            }
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
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
                    <Input id="member-emergency" placeholder="+1234567890" autoComplete="off" {...field} value={field.value || ""} />
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
                      value={field.value || ""}
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