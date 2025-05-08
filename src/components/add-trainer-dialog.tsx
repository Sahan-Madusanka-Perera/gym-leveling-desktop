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

type TrainerFormData = Omit<Trainer, "id">

export function AddTrainerDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema.omit({ id: true })),
    defaultValues: {
      name: "",
      specialization: "",
      contact: "",
    },
  })

  async function onSubmit(data: TrainerFormData) {
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("specialization", data.specialization || "")
      formData.append("contact", data.contact || "")

      await addTrainer(formData)
      toast.success("Trainer added successfully")
      form.reset()
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Failed to add trainer")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon />
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <Button type="submit">Add Trainer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 