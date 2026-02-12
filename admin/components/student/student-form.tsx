"use client";

import {
  BaseForm,
  DatePickerField,
  DynamicSocialMediaField,
  EmailField,
  FilePickerField,
  InputField,
  MapField,
  PhoneField,
  RadioField,
} from "@/components/base/form";
import { TextareaField } from "@/components/base/form/textarea-field";
import { GENDER_OPTIONS } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, MapPin, Share2, ShieldCheck, User, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Create conditional schema based on mode
const createStudentFormSchema = (isEditMode: boolean) =>
  z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: isEditMode
      ? z.string().optional()
      : z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    gender: z.enum(
      GENDER_OPTIONS.map((option) => option.value),
      {
        message: "Please select a gender",
      }
    ),
    dateOfBirth: z.date({
      message: "Date of birth is required",
    }),
    address: z.string().optional(),
    premiumUntil: z.date().nullable().optional(),
    profilePhoto: z
      .object({
        url: z.string(),
        key: z.string(),
        filename: z.string(),
        size: z.number(),
      })
      .optional(),
    location: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .optional(),
    socialMediaLinks: z
      .array(
        z.object({
          platform: z.string().min(1, "Platform name is required"),
          url: z.string().url("Invalid URL format"),
        })
      )
      .optional()
      .refine(
        (links) => {
          if (!links || links.length === 0) return true;
          const validLinks = links.filter(
            (link) => link.platform.trim() !== "" || link.url.trim() !== ""
          );
          return validLinks.every(
            (link) => link.platform.trim() !== "" && link.url.trim() !== ""
          );
        },
        {
          message: "Both platform and URL must be filled or left empty",
        }
      ),
  });

type StudentFormValues = z.infer<ReturnType<typeof createStudentFormSchema>>;

// Helper function to format date to yyyy-mm-dd
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Backend payload type matching CreateStudentPayload
export type StudentSubmitPayload = {
  dateOfBirth: string;
  email: string;
  gender: string;
  latitude: number;
  longitude: number;
  name: string;
  password?: string;
  phoneNumber: string;
  photoProfile: string;
  socialMediaLinks: Record<string, string>;
  premiumUntil?: string;
};

interface StudentFormProps {
  initialData?: Partial<StudentFormValues>;
  isEditMode?: boolean;
  action: (
    payload: StudentSubmitPayload
  ) => Promise<{ success: boolean; error?: string; data?: unknown }>;
}

export function StudentForm({
  initialData,
  isEditMode = false,
  action,
}: StudentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(createStudentFormSchema(isEditMode)),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: initialData?.password || "",
      phoneNumber: initialData?.phoneNumber || "",
      gender: initialData?.gender || undefined,
      dateOfBirth: initialData?.dateOfBirth
        ? initialData.dateOfBirth instanceof Date
          ? initialData.dateOfBirth
          : new Date(initialData.dateOfBirth as unknown as string)
        : undefined,
      address: initialData?.address || "",
      premiumUntil: initialData?.premiumUntil
        ? initialData.premiumUntil instanceof Date
          ? initialData.premiumUntil
          : new Date(initialData.premiumUntil as unknown as string)
        : undefined,
      profilePhoto: initialData?.profilePhoto || undefined,
      location: initialData?.location || undefined,
      socialMediaLinks: initialData?.socialMediaLinks || [],
    },
  });

  const passwordValue = form.watch("password") || "";

  // Transform the form data to match backend API structure
  const handleFormSubmit = async (data: StudentFormValues) => {
    setIsLoading(true);

    try {
      const filteredLinks =
        data.socialMediaLinks?.filter(
          (link) => link.platform.trim() !== "" && link.url.trim() !== ""
        ) || [];

      const transformedData: StudentSubmitPayload = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        password: data.password || undefined,
        dateOfBirth: data.dateOfBirth
          ? formatDateToString(data.dateOfBirth)
          : "",
        latitude: data.location?.lat || 0,
        longitude: data.location?.lng || 0,
        photoProfile: data.profilePhoto?.url || "",
        socialMediaLinks: filteredLinks.reduce((acc, link) => {
          acc[link.platform] = link.url;
          return acc;
        }, {} as Record<string, string>),
        premiumUntil: data.premiumUntil
          ? formatDateToString(data.premiumUntil)
          : undefined,
      };

      const result = await action(transformedData);

      if (result.success) {
        toast.success(
          isEditMode
            ? "Student updated successfully!"
            : "Student created successfully!"
        );
        router.push("/students");
        router.refresh();
      } else {
        toast.error(
          result.error ||
          `Failed to ${isEditMode ? "update" : "create"} student`
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[800px] mx-auto pb-24">
      {/* Breadcrumb */}
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <Link href="/dashboard" className="text-slate-500 hover:text-[#7c3bed] transition-colors text-sm font-medium">Dashboard</Link>
        <ChevronRight className="size-4 text-slate-400" />
        <Link href="/students" className="text-slate-500 hover:text-[#7c3bed] transition-colors text-sm font-medium">Students</Link>
        <ChevronRight className="size-4 text-slate-400" />
        <span className="text-slate-900 dark:text-white text-sm font-medium">{isEditMode ? "Edit" : "Register"}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {isEditMode ? "Edit Student" : "Student Registration"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base">
          {isEditMode
            ? "Update the student profile information below."
            : "Create a new student profile by filling out the information below."}
        </p>
      </div>

      <BaseForm form={form} onSubmit={handleFormSubmit}>
        <div className="flex flex-col gap-8">

          {/* Account Information */}
          <section className="bg-white dark:bg-[#1e1a29] rounded-2xl border border-slate-200 dark:border-[#2d2a35] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2d2a35] bg-slate-50/50 dark:bg-white/5 flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <ShieldCheck className="size-5 text-violet-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white dark:text-white">Account Information</h3>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  name="name"
                  label="Full Name"
                  placeholder="e.g. Alexa Smith"
                  required
                />
                <EmailField
                  name="email"
                  label="Email Address"
                  placeholder="alexa@example.com"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <InputField
                    name="password"
                    label="Password"
                    type="password"
                    placeholder={isEditMode ? "Leave blank to keep current" : "Create a secure password"}
                    required={!isEditMode}
                  />
                  {!isEditMode && passwordValue && (
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex flex-1 gap-1 h-1.5">
                        <div className={`h-full rounded-full transition-all ${passwordValue.length > 3 ? "w-1/4 bg-emerald-500" : "w-1/4 bg-slate-200 dark:bg-slate-700"}`}></div>
                        <div className={`h-full rounded-full transition-all ${passwordValue.length > 7 ? "w-1/4 bg-emerald-500" : "w-1/4 bg-slate-200 dark:bg-slate-700"}`}></div>
                        <div className={`h-full rounded-full transition-all ${passwordValue.length > 10 ? "w-1/4 bg-emerald-500" : "w-1/4 bg-slate-200 dark:bg-slate-700"}`}></div>
                        <div className={`h-full rounded-full transition-all ${passwordValue.length > 12 ? "w-1/4 bg-emerald-500" : "w-1/4 bg-slate-200 dark:bg-slate-700"}`}></div>
                      </div>
                      <span className={`text-xs font-medium whitespace-nowrap ${passwordValue.length > 10 ? "text-emerald-600" : "text-slate-400"}`}>
                        {passwordValue.length > 10 ? "Strong" : passwordValue.length > 5 ? "Medium" : "Weak"}
                      </span>
                    </div>
                  )}
                </div>
                <PhoneField
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>
          </section>

          {/* Personal Details */}
          <section className="bg-white dark:bg-[#1e1a29] rounded-2xl border border-slate-200 dark:border-[#2d2a35] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2d2a35] bg-slate-50/50 dark:bg-white/5 flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <User className="size-5 text-violet-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white dark:text-white">Personal Details</h3>
            </div>
            <div className="p-6 flex flex-col gap-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-auto">
                  <FilePickerField
                    name="profilePhoto"
                    label="Profile Photo"
                    description="Upload a profile photo"
                    accept="image/*"
                    maxSize={2 * 1024 * 1024}
                  />
                </div>
                <div className="flex-1 w-full grid md:grid-cols-2 gap-6">
                  <RadioField
                    name="gender"
                    label="Gender"
                    options={GENDER_OPTIONS}
                    required
                    orientation="horizontal"
                  />
                  <DatePickerField
                    name="dateOfBirth"
                    label="Date of Birth"
                    placeholder="Select date"
                    required
                    maxDate={new Date()}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Address & Location */}
          <section className="bg-white dark:bg-[#1e1a29] rounded-2xl border border-slate-200 dark:border-[#2d2a35] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2d2a35] bg-slate-50/50 dark:bg-white/5 flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <MapPin className="size-5 text-violet-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white dark:text-white">Address & Location</h3>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <TextareaField
                name="address"
                label="Home Address"
                placeholder="Street name, number, apartment..."
                rows={3}
              />
              <MapField
                name="location"
                label="Pin Location"
                description="Drag to adjust student location"
                defaultCenter={{ lat: -6.2088, lng: 106.8456 }}
                defaultZoom={13}
              />
            </div>
          </section>

          {/* Social Media */}
          <section className="bg-white dark:bg-[#1e1a29] rounded-2xl border border-slate-200 dark:border-[#2d2a35] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2d2a35] bg-slate-50/50 dark:bg-white/5 flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <Share2 className="size-5 text-violet-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white dark:text-white">Social Media</h3>
            </div>
            <div className="p-6">
              <DynamicSocialMediaField
                name="socialMediaLinks"
                label=""
                description="Add links to social media profiles"
              />
            </div>
          </section>

          {/* Premium Subscription */}
          <section className="bg-white dark:bg-[#1e1a29] rounded-2xl border border-slate-200 dark:border-[#2d2a35] shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none"></div>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2d2a35] bg-slate-50/50 dark:bg-white/5 flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Star className="size-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white dark:text-white text-amber-600 dark:text-amber-500">Premium Subscription</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 w-full">
                  <DatePickerField
                    name="premiumUntil"
                    label="Premium Valid Until"
                    placeholder="Select expiry date"
                    minDate={new Date()}
                  />
                </div>
                <div className="w-full md:w-auto bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <Star className="size-5 text-amber-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-amber-800 dark:text-amber-500">Pro Student Status</span>
                    <span className="text-xs text-amber-700/80 dark:text-amber-500/70">Access to all premium materials</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-[18rem] bg-white/80 dark:bg-[#171121]/80 backdrop-blur-xl border-t border-slate-200 dark:border-[#2d2a35] px-6 py-4 z-40 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-600/20 flex items-center gap-2 transition-all active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <ShieldCheck className="size-5" />
              )}
              {isEditMode ? "Update Student" : "Register Student"}
            </button>
          </div>
        </div>
      </BaseForm>
    </div>
  );
}
