"use client"

import { updateAccountAction } from "@/actions/account"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Icon, type name } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FileItem, MeResponse } from "@/utils/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon, Check, Edit2, Lock, Plus, User, X } from "lucide-react"
import Image from "next/image"
import { useState, useTransition } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { FilePicker } from "../file-picker"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(15, {
    message: "Nama maksimal 15 karakter",
  }),
  gender: z.string().min(1, "Gender is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  social_media: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url("Please enter a valid URL").or(z.literal("")),
    })
  ),
})

type FormData = z.infer<typeof formSchema>

type AccountInfoFormProps = {
  detail: MeResponse
  onSuccess?: () => void
}

const socialMediaPlatforms: { value: name; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "threads", label: "Threads" },
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "link", label: "Website" },
] as const

// Helper function to parse date from different formats
const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null

  // Try parsing as dd/MM/yyyy (form format)
  let parsedDate = parse(dateString, "dd/MM/yyyy", new Date())
  if (isValid(parsedDate)) return parsedDate

  // Try parsing as yyyy-MM-dd (API format)
  parsedDate = parse(dateString, "yyyy-MM-dd", new Date())
  if (isValid(parsedDate)) return parsedDate

  return null
}

// Helper function to format date for display
const formatDateForDisplay = (dateString: string): string => {
  const date = parseDate(dateString)
  return date ? format(date, "dd/MM/yyyy") : ""
}

// Helper function to format date for API
const formatDateForAPI = (dateString: string): string => {
  const date = parseDate(dateString)
  return date ? format(date, "yyyy-MM-dd") : ""
}

export function AccountInfoForm({ detail, onSuccess }: AccountInfoFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isOpenFilePicker, setIsOpenFilePicker] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<FileItem | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: detail.name || "",
      gender: detail.gender || "",
      date_of_birth: formatDateForDisplay(detail.date_of_birth || ""),
      phone_number: detail.phone_number || "",
      social_media: Object.entries(detail.social_media_link || {}).map(([platform, url]) => ({
        platform,
        url,
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "social_media",
  })

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        setError(null)

        // Transform social media array to Record<string, string>
        const socialMediaLink = data.social_media.reduce(
          (acc, item) => {
            if (item.url) {
              acc[item.platform] = item.url
            }
            return acc
          },
          {} as Record<string, string>
        )

        // Create FormData for server action
        const formData = new FormData()
        formData.append("name", data.name)
        formData.append("phoneNumber", data.phone_number)
        formData.append("dateOfBirth", formatDateForAPI(data.date_of_birth))
        formData.append("gender", data.gender)
        // Use selected photo URL if available, otherwise use existing photo
        formData.append("photoProfile", selectedPhoto?.url || detail.photo_profile || "")
        formData.append("socialMediaLink", JSON.stringify(socialMediaLink))

        const result = await updateAccountAction(formData)

        if (result.success) {
          onSuccess?.()
          toast.success("Profile updated successfully")
          setSelectedPhoto(null) // Reset selected photo after successful update
        } else {
          setError(result.message || "Failed to update profile")
        }
      } catch (error) {
        setError("An error occurred while updating profile")
        console.error("Update profile error:", error)
      }
    })
  }

  const addSocialMedia = () => {
    append({ platform: "instagram", url: "" })
  }

  const handlePhotoUpload = (file: FileItem) => {
    setSelectedPhoto(file)
    setIsOpenFilePicker(false)
    toast.success("Photo selected successfully")
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 bg-white rounded-2xl shadow-md relative"
        >
          {/* Header image */}
          <div className="relative w-40 h-40 mx-auto">
            {selectedPhoto?.url || detail.photo_profile ? (
              <Image
                src={selectedPhoto?.url || detail.photo_profile || ""}
                alt="Profile"
                fill
                className="rounded-2xl object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center">
                <User className="w-20 h-20 text-gray-400" />
              </div>
            )}
            <Button
              type="button"
              size="icon"
              className="hover:bg-white absolute bottom-2 right-2 rounded-lg bg-white shadow-md"
              onClick={() => setIsOpenFilePicker(true)}
            >
              <Edit2 className="w-4 h-4 text-main" />
            </Button>
          </div>

          {/* Check icon */}
          <div className="absolute top-4 right-4 bg-main rounded-full">
            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-main hover:bg-main"
              disabled={isPending}
            >
              <Check className="w-5 h-5 text-white" />
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Nama */}
          <div className="mt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-500">Nama</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-main focus-visible:ring-main"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Gender & DOB */}
          <div className="mt-4 flex justify-between items-start gap-3">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-500">Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="border-main focus-visible:ring-main">
                        <SelectValue placeholder="Pilih Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pria">Pria</SelectItem>
                      <SelectItem value="Wanita">Wanita</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-500">Tanggal Lahir</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-main focus-visible:ring-main"
                          disabled={isPending}
                        >
                          <CalendarIcon className="w-4 h-4 text-main mr-2" />
                          {field.value ? (
                            field.value
                          ) : (
                            <span className="text-gray-500">DD/MM/YYYY</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={parseDate(field.value) || undefined}
                          captionLayout="dropdown"
                          onSelect={date => {
                            if (date) {
                              field.onChange(format(date, "dd/MM/yyyy"))
                            }
                          }}
                          disabled={date => date > new Date() || date < new Date("1900-01-01")}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <div className="mt-4">
            <FormItem>
              <FormLabel className="text-sm text-gray-500">Email</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2 border rounded-lg px-2 py-2 bg-gray-100">
                  <input
                    type="email"
                    disabled
                    value={detail.email}
                    className="w-full bg-transparent outline-none text-sm text-gray-500"
                  />
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              </FormControl>
            </FormItem>
          </div>

          {/* Nomor Handphone */}
          <div className="mt-4">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-500">Nomor Handphone</FormLabel>
                  <FormControl>
                    <div
                      className={`flex items-center border rounded-lg px-2 ${
                        fieldState.error ? "border-red-500" : "border-main"
                      }`}
                    >
                      <Icon name="whatsapp" className="w-4 h-4" fill="#7000FE" />
                      <Input
                        {...field}
                        type="text"
                        className="border-0 focus-visible:ring-0 shadow-none"
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Social Media */}
          <div className="mt-4">
            <FormLabel className="text-sm text-gray-500">Social Media</FormLabel>
            <div className="space-y-2 mt-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`social_media.${index}.platform`}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <SelectTrigger
                          className="w-fit border-main bg-main"
                          iconClassName="text-white opacity-100"
                        >
                          <div className="p-1 bg-main rounded text-white">
                            <Icon
                              name={field.value as any}
                              className="w-4 h-4 text-white"
                              fill="#fff"
                            />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {socialMediaPlatforms.map(platform => (
                            <SelectItem key={platform.value} value={platform.value}>
                              <div className="flex items-center gap-2">
                                <Icon name={platform.value} className="w-4 h-4" />
                                {platform.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`social_media.${index}.url`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter social media URL"
                            className="border-main focus-visible:ring-main"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-500"
                    onClick={() => remove(index)}
                    disabled={isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full border-gray-300"
                onClick={addSocialMedia}
                disabled={isPending}
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </form>
      </Form>
      <FilePicker
        isOpen={isOpenFilePicker}
        onClose={() => setIsOpenFilePicker(false)}
        onUpload={handlePhotoUpload}
      />
    </div>
  )
}
