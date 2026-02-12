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
} from "@/components/base/form";
import { Button } from "@/components/ui/button";
import { GENDER_OPTIONS } from "@/utils/constants";
import { FileResponse } from "@/utils/types/file";
import { zodResolver } from "@hookform/resolvers/zod";
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
    levelPoint: z.string().min(1, "Level is required"),
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
      return initialData.levelPoint <= 24 ? "0" : "25";
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
              data.dateOfBirth.getMonth() + 1
            ).padStart(2, "0")}-${String(data.dateOfBirth.getDate()).padStart(
              2,
              "0"
            )}`
          : "",
        latitude: data.location?.lat || 0,
        longitude: data.location?.lng || 0,
        photoProfile: data.profilePhoto?.url || "",
        levelPoint: Number(data.levelPoint),
        socialMediaLinks: filteredLinks.reduce((acc, link) => {
          acc[link.platform] = link.url;
          return acc;
        }, {} as Record<string, string>),
      };

      const result = await action(transformedData);

      if (result.success) {
        toast.success(
          isEditMode
            ? "Tutor updated successfully!"
            : "Tutor created successfully!"
        );
        router.push("/tutors");
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
  );
}
