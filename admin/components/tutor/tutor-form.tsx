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
  SelectField,
<<<<<<< HEAD
} from "@/components/base/form";
import { Button } from "@/components/ui/button";
import { GENDER_OPTIONS } from "@/utils/constants";
import { FileResponse } from "@/utils/types/file";
import { zodResolver } from "@hookform/resolvers/zod";
=======
  TextareaField,
} from "@/components/base/form";
import { Button } from "@/components/ui/button";
import { GENDER_OPTIONS } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Badge,
  ChevronRight,
  MapPin,
  Share2,
  School,
  User,
  Check
} from "lucide-react";
import Link from "next/link";
>>>>>>> 1a19ced (chore: update service folders from local)
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Tutor level options
const TUTOR_LEVEL_OPTIONS = [
  { label: "Guru Aktif (0-24 points)", value: "0" },
  { label: "Guru Favorit (25+ points)", value: "25" },
];

// Create conditional schema based on mode
const createTutorFormSchema = (isEditMode: boolean) =>
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
<<<<<<< HEAD
          .string()
          .min(1, "Password is required")
          .min(8, "Password must be at least 8 characters"),
=======
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
>>>>>>> 1a19ced (chore: update service folders from local)
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
    levelPoint: z.string().min(1, "Level is required"),
<<<<<<< HEAD
=======
    // Bio & Subjects included in Schema for UI, but might not be sent to backend yet
    bio: z.string().optional(),
    subjects: z.array(z.string()).optional(),
>>>>>>> 1a19ced (chore: update service folders from local)
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

type TutorFormValues = z.infer<ReturnType<typeof createTutorFormSchema>>;

// Backend payload type matching CreateTutorPayload
export type TutorSubmitPayload = {
  dateOfBirth: string;
  email: string;
  gender: string;
  latitude: number;
  longitude: number;
  name: string;
  password?: string;
  phoneNumber: string;
  photoProfile: string;
  levelPoint: number;
  socialMediaLinks: Record<string, string>;
<<<<<<< HEAD
=======
  // bio?: string; // Not yet supported by backend
  // subjects?: string[]; // Not yet supported by backend
>>>>>>> 1a19ced (chore: update service folders from local)
};

interface TutorFormProps {
  initialData?: Omit<Partial<TutorFormValues>, "levelPoint"> & {
    levelPoint?: number;
  };
  isEditMode?: boolean;
  action: (
    payload: TutorSubmitPayload
  ) => Promise<{ success: boolean; error?: string; data?: unknown }>;
}

export function TutorForm({
  initialData,
  isEditMode = false,
  action,
}: TutorFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Determine initial level point value for select
  const getInitialLevelPoint = () => {
    if (initialData?.levelPoint !== undefined) {
<<<<<<< HEAD
      return initialData.levelPoint <= 24 ? "0" : "25";
=======
      // Logic to map numeric points back to select value if needed, 
      // or just assume standard endpoints 0/25 for creation default.
      // For edit, we might need smarter mapping if points are e.g. 30.
      return initialData.levelPoint >= 25 ? "25" : "0";
>>>>>>> 1a19ced (chore: update service folders from local)
    }
    return "";
  };

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(createTutorFormSchema(isEditMode)),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: initialData?.password || "",
      phoneNumber: initialData?.phoneNumber || "",
      gender: initialData?.gender || undefined,
      dateOfBirth: initialData?.dateOfBirth || undefined,
      levelPoint: getInitialLevelPoint(),
      profilePhoto: initialData?.profilePhoto || undefined,
      location: initialData?.location || undefined,
      socialMediaLinks: initialData?.socialMediaLinks || [],
<<<<<<< HEAD
=======
      bio: "", // Placeholder
      subjects: [], // Placeholder
>>>>>>> 1a19ced (chore: update service folders from local)
    },
  });

  // Transform the form data to match backend API structure
  const handleFormSubmit = async (data: TutorFormValues) => {
    setIsLoading(true);

    try {
      const filteredLinks =
        data.socialMediaLinks?.filter(
          (link) => link.platform.trim() !== "" && link.url.trim() !== ""
        ) || [];

      const transformedData: TutorSubmitPayload = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        password: data.password,
        dateOfBirth: data.dateOfBirth
          ? `${data.dateOfBirth.getFullYear()}-${String(
<<<<<<< HEAD
              data.dateOfBirth.getMonth() + 1
            ).padStart(2, "0")}-${String(data.dateOfBirth.getDate()).padStart(
              2,
              "0"
            )}`
=======
            data.dateOfBirth.getMonth() + 1
          ).padStart(2, "0")}-${String(data.dateOfBirth.getDate()).padStart(
            2,
            "0"
          )}`
>>>>>>> 1a19ced (chore: update service folders from local)
          : "",
        latitude: data.location?.lat || 0,
        longitude: data.location?.lng || 0,
        photoProfile: data.profilePhoto?.url || "",
        levelPoint: Number(data.levelPoint),
        socialMediaLinks: filteredLinks.reduce((acc, link) => {
          acc[link.platform] = link.url;
          return acc;
        }, {} as Record<string, string>),
<<<<<<< HEAD
=======
        // Note: 'bio' and 'subjects' are collected but discarded here 
        // because the backend CreateTutorPayload does not support them.
>>>>>>> 1a19ced (chore: update service folders from local)
      };

      const result = await action(transformedData);

      if (result.success) {
        toast.success(
          isEditMode
            ? "Tutor updated successfully!"
            : "Tutor created successfully!"
        );
<<<<<<< HEAD
        router.push("/tutors");
=======
        router.push("/tutors"); // Ensure correct path
>>>>>>> 1a19ced (chore: update service folders from local)
        router.refresh();
      } else {
        toast.error(
          result.error || `Failed to ${isEditMode ? "update" : "create"} tutor`
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
<<<<<<< HEAD
    <BaseForm form={form} onSubmit={handleFormSubmit} className="space-y-6">
      <InputField
        name="name"
        label="Full Name"
        placeholder="Enter tutor name"
        required
      />

      <EmailField
        name="email"
        label="Email Address"
        placeholder="tutor@example.com"
        required
      />

      <InputField
        name="password"
        label="Password"
        placeholder="Enter password"
        description="leave blank if not changing"
        required
      />

      <PhoneField
        name="phoneNumber"
        label="Phone Number"
        placeholder="+1 (555) 000-0000"
        required
      />

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
        placeholder="Select date of birth"
        required
        maxDate={new Date()}
      />

      <SelectField
        name="levelPoint"
        label="Tutor Level"
        placeholder="Select tutor level"
        options={TUTOR_LEVEL_OPTIONS}
        required
      />

      <FilePickerField
        name="profilePhoto"
        label="Profile Photo"
        description="Upload a profile photo (Max 5MB)"
        accept="image/*"
        maxSize={5 * 1024 * 1024}
        onUploadComplete={(file: FileResponse) => {
          console.log("File uploaded:", file);
        }}
      />

      <MapField
        name="location"
        label="Tutor Location"
        description="Select the tutor's location on the map or enter coordinates"
        defaultCenter={{ lat: -6.2088, lng: 106.8456 }}
        defaultZoom={13}
      />

      <DynamicSocialMediaField
        name="socialMediaLinks"
        label="Social Media Links"
        description="Add links to social media profiles"
        platformPlaceholder="Platform name (e.g., Instagram)"
        urlPlaceholder="Profile URL"
      />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEditMode ? "Update Tutor" : "Save Tutor"}
        </Button>
      </div>
    </BaseForm>
=======
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto pb-24">

      {/* Breadcrumb - matching HTML style (optional if Layout already has it) */}
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <Link href="/dashboard" className="text-slate-500 hover:text-[#7c3bed] transition-colors text-sm font-medium">Dashboard</Link>
        <ChevronRight className="size-4 text-slate-400" />
        <Link href="/tutors" className="text-slate-500 hover:text-[#7c3bed] transition-colors text-sm font-medium">Tutors</Link>
        <ChevronRight className="size-4 text-slate-400" />
        <span className="text-slate-900 dark:text-white text-sm font-medium">{isEditMode ? "Edit" : "Register"}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {isEditMode ? "Edit Tutor Profile" : "Register New Tutor"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
          {isEditMode ? "Update tutor information and settings." : "Create a new tutor profile. Fill in account credentials, personal details, professional info, and pin their location."}
        </p>
      </div>

      <BaseForm form={form} onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column */}
          <div className="flex flex-col gap-8">

            {/* Account Info Card */}
            <div className="bg-white dark:bg-[#1e1629] rounded-xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#7c3bed]/10 rounded-lg text-[#7c3bed]">
                  <Badge className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Account Information</h3>
              </div>

              <div className="flex flex-col gap-6">
                <InputField
                  name="name"
                  label="Full Name"
                  placeholder="e.g. Jane Doe"
                  required
                />

                <EmailField
                  name="email"
                  label="Email Address"
                  placeholder="jane.doe@example.com"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PhoneField
                    name="phoneNumber"
                    label="Phone Number"
                    placeholder="+1 (555) 000-0000"
                    required
                  />

                  <InputField
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="Leave blank to keep current"
                    description={!isEditMode ? "Min. 8 characters" : undefined}
                    required={!isEditMode}
                  />
                </div>
              </div>
            </div>

            {/* Personal Details Card */}
            <div className="bg-white dark:bg-[#1e1629] rounded-xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#7c3bed]/10 rounded-lg text-[#7c3bed]">
                  <User className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal Details</h3>
              </div>

              <div className="flex flex-col gap-6">

                <FilePickerField
                  name="profilePhoto"
                  label="Profile Photo"
                  description="Upload a professional photo. Recommended size 400x400px."
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DatePickerField
                    name="dateOfBirth"
                    label="Date of Birth"
                    placeholder="Select date of birth"
                    required
                    maxDate={new Date()}
                  />

                  <RadioField
                    name="gender"
                    label="Gender"
                    options={GENDER_OPTIONS}
                    required
                    orientation="horizontal"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">

            {/* Social Media Card */}
            <div className="bg-white dark:bg-[#1e1629] rounded-xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#7c3bed]/10 rounded-lg text-[#7c3bed]">
                    <Share2 className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Social Media</h3>
                </div>
                {/* Dynamic actions handled inside DynamicSocialMediaField */}
              </div>

              <DynamicSocialMediaField
                name="socialMediaLinks"
                label="" // hidden label
                description=""
                platformPlaceholder="Platform (e.g. LinkedIn)"
                urlPlaceholder="https://..."
              />
            </div>

            {/* Professional Profile Card */}
            <div className="bg-white dark:bg-[#1e1629] rounded-xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#7c3bed]/10 rounded-lg text-[#7c3bed]">
                  <School className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Professional Profile</h3>
              </div>

              <div className="flex flex-col gap-6">
                <SelectField
                  name="levelPoint"
                  label="Tutor Level"
                  placeholder="Select tutor level"
                  options={TUTOR_LEVEL_OPTIONS}
                  required
                />

                {/* Bio - UI Only */}
                <TextareaField
                  name="bio"
                  label="Bio / About Me"
                  placeholder="Tell us about the tutor's background and teaching philosophy..."
                  className="h-32"
                />

                {/* Teaching Subjects - UI Only Placeholder */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Teaching Subjects</label>
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500 text-center italic">
                    Subject management will be available after creating the tutor profile.
                  </div>
                </div>
              </div>
            </div>

            {/* Teaching Area Card (Map) */}
            <div className="bg-white dark:bg-[#1e1629] rounded-xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#7c3bed]/10 rounded-lg text-[#7c3bed]">
                  <MapPin className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Teaching Area</h3>
              </div>

              <MapField
                name="location"
                label=""
                description="Pin the tutor's primary location or teaching center."
                defaultCenter={{ lat: -6.2088, lng: 106.8456 }}
                defaultZoom={13}
              />
            </div>

          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e1629] border-t border-slate-200 dark:border-slate-800 p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
              {/* Last autosaved... (optional) */}
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={isLoading}
                className="px-6 py-3 h-auto text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 h-auto bg-[#7c3bed] hover:bg-[#6d28d9] shadow-lg shadow-[#7c3bed]/30 text-white font-semibold flex items-center gap-2"
              >
                <Check className="size-5" />
                {isLoading ? "Saving..." : isEditMode ? "Update Tutor" : "Save Tutor"}
              </Button>
            </div>
          </div>
        </div>
      </BaseForm>
    </div>
>>>>>>> 1a19ced (chore: update service folders from local)
  );
}
