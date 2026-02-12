"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CurrencyIdrInput } from "@/components/ui/currency-idr-input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { MultipleSelect } from "@/components/ui/multiple-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { CourseSaved } from "@/utils/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Plus, SquarePen, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { useStep } from "./course-management-container"
import { SectionTitle } from "./section-title"

type Section = "audience" | "about" | "pricing" | "schedule"

const formSchema = z.object({
  classType: z.array(z.string()), // e.g. ["all"] or ["Online","Offline"]
  courseCategoryID: z.string().optional(),
  coursePrices: z.object({
    offline: z
      .array(
        z.object({
          durationInHour: z.number().min(0),
          price: z.number().min(0),
        })
      )
      .min(1),
    online: z
      .array(
        z.object({
          durationInHour: z.number().min(0),
          price: z.number().min(0),
        })
      )
      .min(1),
  }),
  courseSchedulesOffline: z.record(
    z.string(),
    z.array(
      z.object({
        startTime: z.string(),
        timezone: z.string(),
      })
    )
  ),
  courseSchedulesOnline: z.record(
    z.string(),
    z.array(
      z.object({
        startTime: z.string(),
        timezone: z.string(),
      })
    )
  ),
  description: z.string().optional(),
  isFreeFirstCourse: z.boolean(),
  levelEducationCourses: z.array(z.string()),
  onlineChannel: z.array(z.string()),
  subCategoryIDs: z.array(z.string()),
  title: z.string().optional(),
  tutorDescription: z.string().optional(),
  // Virtual fields for 1-hour pricing (not sent to API)
  oneHourOnlinePrice: z.number().min(0).optional(),
  oneHourOfflinePrice: z.number().min(0).optional(),
})

type FormData = z.infer<typeof formSchema>

export const SectionTitleAudience = ({ className }: { className?: string }) => (
  <SectionTitle
    className={className}
    title="Panduan Pengisian"
    subtitle="Ikuti langkah-langkah berikut untuk mengisi form dengan benar:"
  >
    <ol className="list-decimal font-bold">
      <li>
        <p>Pilih Tingkat Pendidikan</p>
        <p className="font-normal">
          Pada bagian “<b>Pilih tingkat</b>”, centang satu atau beberapa opsi sesuai jenjang
          pendidikan yang relevan dengan materi kamu.
        </p>
      </li>
      <li>
        <p>Pilih Subjek Utama</p>
        <p className="font-normal">
          Di kolom “<b>Pilih subjek/mata pelajaran</b>”, klik kolom pencarian lalu ketik nama mata
          pelajaran yang ingin kamu isi. Misalnya: Matematika, Bahasa Indonesia, atau IPA.
        </p>
      </li>
      <li>
        <p>Pilih Sub-Subjek (Topik Spesifik)</p>
        <p className="font-normal">
          Setelah memilih subjek utama, akan muncul daftar sub-subjek di bawahnya.Centang
          topik-topik yang sesuai dengan materi kamu.
          <br />
          <br />
          <b>Misalnya</b>: jika kamu memilih “Matematika”, kamu bisa centang “Geometri”, “Aljabar”,
          atau “Statistika”.
        </p>
      </li>
    </ol>
  </SectionTitle>
)
export const SectionTitleAbout = ({ className }: { className?: string }) => (
  <SectionTitle
    className={className}
    title="Panduan Pengisian"
    subtitle="Ikuti langkah-langkah berikut untuk mengisi form dengan benar:"
  >
    <ol className="list-decimal font-bold">
      <li>
        <p>Isi Judul Course</p>
        <p className="font-normal">
          Pada kolom <b>Judul Course</b>, tuliskan nama atau judul utama dari course yang kamu buat.
          <br />
          <br />
          Gunakan judul yang jelas dan menggambarkan isi course.
          <br />
          <br />
          Contoh: Dasar-dasar aljabar untuk persiapan Ujian Nasional SD sampai SMA
        </p>
      </li>
      <li>
        <p>Isi Tentang Course</p>
        <p className="font-normal">
          Pada kolom <b>Tentang Course</b>, jelaskan secara singkat mengenai isi atau tujuan dari
          course ini.
          <ul className="list-disc">
            <li>Tuliskan manfaat utama yang akan diperoleh peserta.</li>
            <li>Sertakan topik-topik utama yang akan dibahas.</li>
            <li>Gunakan bahasa yang menarik dan mudah dipahami.</li>
          </ul>
        </p>
      </li>
      <li>
        <p>Isi Tentang Tutor</p>
        <p className="font-normal">
          Pada kolom <b>Tentang Tutor</b>, perkenalkan tutor yang mengajar course ini.
          <ul className="list-disc">
            <li>Sebutkan nama, pengalaman singkat, dan keahlian utama.</li>
            <li>Gunakan deskripsi yang menunjukkan kredibilitas tutor.</li>
          </ul>
        </p>
      </li>
    </ol>
  </SectionTitle>
)
export const SectionTitlePricing = ({ className }: { className?: string }) => (
  <SectionTitle
    className={className}
    title="Panduan Pengisian"
    subtitle="Form ini digunakan untuk mengatur tipe, tarif, dan paket pembelajaran course kamu. Ikuti langkah-langkah berikut agar pengisian berjalan lancar:"
  >
    <ol className="list-decimal font-bold">
      <li>
        <p>Pilih Tipe Course</p>
        <p className="font-normal">
          Tentukan jenis pembelajaran yang kamu tawarkan:
          <br />
          <br />
          Centang <b>ONLINE</b> jika course dilakukan secara daring.
          <br />
          Lalu pilih platform yang digunakan, seperti:
          <ul className="list-disc">
            <li>Zoom</li>
            <li>Google Meet</li>
            <li>Microsoft Teams</li>
          </ul>
          <br />
          <br />
          Centang <b>OFFLINE</b> jika course dilakukan secara tatap muka di lokasi tertentu.
          <br />
          <br />
          Kamu bisa memilih salah satu atau keduanya jika course tersedia dalam dua format.
        </p>
      </li>
      <li>
        <p>Isi Tarif Course</p>
        <p className="font-normal">
          Masukkan biaya kursus utama berdasarkan tipe course:
          <ul className="list-disc">
            <li>
              <b>ONLINE →</b> Isi kolom di bawah label
              <br />
              <b>“ONLINE”</b> dengan tarif per sesi atau per paket.
            </li>
            <li>
              <b>OFFLINE →</b> Isi kolom di bawah label
              <br />
              <b>“OFFLINE”</b> dengan tarif yang sesuai untuk kelas tatap muka.
            </li>
          </ul>
        </p>
      </li>
      <li>
        <p>Tambahkan Package (Paket Belajar)</p>
        <p className="font-normal">
          Bagian ini digunakan untuk membuat paket kursus berdasarkan durasi dan tarif.
          <ul>
            <li>
              Pada kolom Durasi, pilih jumlah pertemuan, jam, atau minggu sesuai sistem kursusmu.
            </li>
            <li>Pada kolom Tarif, masukkan harga untuk durasi tersebut.</li>
            <li>Klik tombol ( + ) untuk menambah paket baru.</li>
            <li>Klik tanda ( x ) jika ingin menghapus paket tertentu.</li>
          </ul>
        </p>
      </li>
      <li>
        <p>Aktifkan Label “Sesi Pertama Gratis” (Opsional)</p>
        <p className="font-normal">
          Centang opsi ini jika kamu ingin memberikan sesi pertama secara gratis.
          <br />
          <b>Disarankan hanya untuk sesi perkenalan dengan durasi maksimal 30 menit.</b>
        </p>
      </li>
    </ol>
  </SectionTitle>
)

export const SectionTitleSchedule = ({ className }: { className?: string }) => (
  <SectionTitle
    className={className}
    title="Panduan Pengisian"
    subtitle="Gunakan form ini untuk menentukan jadwal ketersediaan mengajar atau sesi course kamu. Pastikan jadwal yang kamu isi sesuai zona waktu dan hari aktif."
  >
    <ol className="list-decimal font-bold">
      <li>
        <p>Pilih Zona Waktu</p>
        <p className="font-normal">
          Pada bagian <b>Zona Waktu</b>, pilih zona waktu tempat kamu berada:
          <ul className="list-disc">
            <li>WIB (Waktu Indonesia Barat)</li>
            <li>WITA (Waktu Indonesia Tengah)</li>
            <li>WIT (Waktu Indonesia Timur)</li>
          </ul>
          Pastikan zona waktu sesuai agar jadwal tidak tertukar dengan waktu peserta.
        </p>
      </li>
      <li>
        <p>Tambahkan Jadwal di Hari Tertentu</p>
        <p className="font-normal">
          Pada bagian Online, pilih hari di mana kamu tersedia. Klik tanda ( + ) untuk menambahkan
          hari baru.
        </p>
      </li>
      <li>
        <p>Atur Waktu Ketersediaan</p>
        <p className="font-normal">
          Setelah memilih hari:
          <ul className="list-disc">
            <li>Klik kolom jam untuk mengatur waktu mulai dan waktu berakhir.</li>
            <li>Gunakan dropdown (tanda panah) untuk memilih jam dan menit.</li>
            <li>Tekan tombol ( + ) untuk menambah rentang waktu tambahan di hari yang sama.</li>
          </ul>
        </p>
      </li>
    </ol>
  </SectionTitle>
)

export const SectionTitleContent = ({
  section,
  className,
}: {
  section: Section
  className?: string
}) => {
  switch (section) {
    case "audience":
      return <SectionTitleAudience className={className} />
    case "about":
      return <SectionTitleAbout className={className} />
    case "pricing":
      return <SectionTitlePricing className={className} />
    case "schedule":
      return <SectionTitleSchedule className={className} />
    default:
      return null
  }
}

const ONLINE_CHANNELS = ["Zoom", "Google Meet", "Microsoft Teams"]
const DURATION_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const TIMEZONE = ["WIT", "WITA", "WIB"]
const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
const INITIAL_DAYS = ["Senin", "Selasa", "Rabu"]

// Schedule management types
type TimeSlot = {
  id: string
  time: string
}

type DaySchedule = {
  day: string
  timeSlots: TimeSlot[]
  isActive: boolean
  isEditing: boolean
  type: "online" | "offline"
}

const ArrowIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="31"
    height="32"
    viewBox="0 0 31 32"
    fill="none"
    className={className}
  >
    <path
      d="M2.07684 13.6152L0.500572 15.1938C-0.166858 15.8622 -0.166858 16.9431 0.500572 17.6045L14.2965 31.4284C14.9639 32.0968 16.0432 32.0968 16.7035 31.4284L30.4994 17.6116C31.1669 16.9431 31.1669 15.8622 30.4994 15.2009L28.9232 13.6223C28.2486 12.9467 27.1481 12.9609 26.4877 13.6507L18.3437 22.2124L18.3437 1.77524C18.3437 0.829463 17.5839 0.0685797 16.6396 0.0685797L14.3675 0.0685798C13.4232 0.0685799 12.6634 0.829463 12.6634 1.77524L12.6634 22.2124L4.51225 13.6436C3.85192 12.9467 2.75137 12.9325 2.07684 13.6152Z"
      fill="#7000FE"
    />
  </svg>
)

const RemoveIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
  >
    <path
      d="M1.2 12L0 10.8L4.8 6L0 1.2L1.2 0L6 4.8L10.8 0L12 1.2L7.2 6L12 10.8L10.8 12L6 7.2L1.2 12Z"
      fill="black"
      fillOpacity="0.25"
    />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <g clipPath="url(#clip0_1216_30362)">
      <path
        d="M16 9.14286H9.14286V16H6.85714V9.14286H0V6.85714H6.85714V0H9.14286V6.85714H16V9.14286Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_1216_30362">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path fillRule="evenodd" clipRule="evenodd" fill="#7000FE" />
  </svg>
)

type ManagementFormProps = {
  detail?: CourseSaved
}

const transformDetailToFormData = (detail: CourseSaved): Partial<FormData> => {
  // Helper function to transform schedules from API format to form format
  const transformSchedules = (schedules: {
    [key: string]: { startTime: string; timezone: string }[]
  }) => {
    const transformed: { [key: string]: { startTime: string; timezone: string }[] } = {}

    Object.entries(schedules).forEach(([dayIndex, timeSlots]) => {
      // Convert day index to day name (assuming 1-7 maps to DAYS_OF_WEEK)
      const dayName = DAYS_OF_WEEK[parseInt(dayIndex) - 1]
      if (dayName && timeSlots && timeSlots.length > 0) {
        transformed[dayName] = timeSlots.map(slot => ({
          startTime: slot.startTime,
          timezone: slot.timezone,
        }))
      }
    })

    return transformed
  }

  return {
    classType:
      detail.classType === "all"
        ? ["Online", "Offline"]
        : detail.classType === "online"
          ? ["Online"]
          : detail.classType === "offline"
            ? ["Offline"]
            : [],
    courseCategoryID: detail.courseCategory.id,
    coursePrices: {
      offline: detail.coursePrices.offline?.map(price => ({
        durationInHour: price.durationInHour,
        price: parseInt(price.price.replace(/[^\d]/g, "")) || 0, // Convert string to number
      })),
      online: detail.coursePrices.online?.map(price => ({
        durationInHour: price.durationInHour,
        price: parseInt(price.price.replace(/[^\d]/g, "")) || 0, // Convert string to number
      })),
    },
    courseSchedulesOffline: transformSchedules(detail.courseSchedulesOffline || {}),
    courseSchedulesOnline: transformSchedules(detail.courseSchedulesOnline || {}),
    description: detail.description,
    isFreeFirstCourse: detail.isFreeFirstCourse,
    levelEducationCourses: detail.levelEducationCourses,
    onlineChannel: detail.onlineChannel,
    subCategoryIDs: detail.subCategoryIDs,
    title: detail.title,
    tutorDescription: detail.tutorDescription,
    // Set the 1-hour prices from the coursePrices
    oneHourOnlinePrice: detail.coursePrices.online?.find(p => p.durationInHour === 1)
      ? parseInt(
          detail.coursePrices.online.find(p => p.durationInHour === 1)!.price.replace(/[^\d]/g, "")
        ) || 0
      : 0,
    oneHourOfflinePrice: detail.coursePrices.offline?.find(p => p.durationInHour === 1)
      ? parseInt(
          detail.coursePrices.offline.find(p => p.durationInHour === 1)!.price.replace(/[^\d]/g, "")
        ) || 0
      : 0,
  }
}

export function ManagementForm({ detail }: ManagementFormProps) {
  const { setFormRef, setFormInstance } = useStep()
  const formRef = useRef<HTMLFormElement>(null!)

  useEffect(() => {
    setFormRef(formRef)
  }, [setFormRef])

  // Transform detail data if provided
  const defaultValues = detail
    ? transformDetailToFormData(detail)
    : {
        classType: [],
        courseCategoryID: "",
        coursePrices: {
          offline: [
            { durationInHour: 1, price: 0 },
            { durationInHour: 2, price: 0 },
          ],
          online: [
            { durationInHour: 1, price: 0 },
            { durationInHour: 2, price: 0 },
          ],
        },
        courseSchedulesOffline: {
          Senin: [{ startTime: "", timezone: "" }],
          Selasa: [{ startTime: "", timezone: "" }],
          Rabu: [{ startTime: "", timezone: "" }],
        },
        courseSchedulesOnline: {
          Senin: [{ startTime: "", timezone: "" }],
          Selasa: [{ startTime: "", timezone: "" }],
          Rabu: [{ startTime: "", timezone: "" }],
        },
        description: "",
        isFreeFirstCourse: true,
        levelEducationCourses: [],
        onlineChannel: [],
        subCategoryIDs: [],
        title: "",
        tutorDescription: "",
        oneHourOnlinePrice: 0,
        oneHourOfflinePrice: 0,
      }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Pass form instance to context
  useEffect(() => {
    setFormInstance(form)
  }, [setFormInstance, form])

  // Schedule state management
  const [schedulesOnline, setSchedulesOnline] = useState<DaySchedule[]>([])
  const [schedulesOffline, setSchedulesOffline] = useState<DaySchedule[]>([])
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    detail?.courseSchedulesOnline
      ? Object.values(detail.courseSchedulesOnline).flat()[0]?.timezone || "WIB"
      : detail?.courseSchedulesOffline
        ? Object.values(detail.courseSchedulesOffline).flat()[0]?.timezone || "WIB"
        : "WIB"
  )
  const [newTimeHour, setNewTimeHour] = useState<string>("09")
  const [newTimeMinute, setNewTimeMinute] = useState<string>("00")
  const [searchCategoryValue, setSearchCategoryValue] = useState(detail?.courseCategory?.name || "")
  const [categorySelected, setCategorySelected] = useState<{ id: string; name: string } | null>(
    detail?.courseCategory
      ? { id: detail.courseCategory.id, name: detail.courseCategory.name }
      : null
  )
  const [subCategoryHasMore, setSubCategoryHasMore] = useState(true)

  // Add these states at the top of your component
  const [subCategoryKey, setSubCategoryKey] = useState(0)
  const [subCategoryOptions, setSubCategoryOptions] = useState<{ id: string; label: string }[]>([])

  // Helper function to create schedule from detail data
  const createScheduleFromDetail = (
    schedules: { [key: string]: { startTime: string; timezone: string }[] },
    type: "online" | "offline"
  ): DaySchedule[] => {
    return Object.entries(schedules).map(([dayKey, timeSlots]) => {
      // Convert day index to day name if it's a numeric key (from API)
      const dayName = isNaN(parseInt(dayKey))
        ? dayKey
        : DAYS_OF_WEEK[parseInt(dayKey) - 1] || dayKey

      return {
        day: dayName,
        timeSlots: timeSlots.map((slot, index) => ({
          id: `${dayName}-${index}-${Date.now()}`,
          time: slot.startTime,
        })),
        isActive: timeSlots.length > 0,
        isEditing: false,
        type,
      }
    })
  }

  // Initialize schedules
  useEffect(() => {
    if (detail?.courseSchedulesOnline && Object.keys(detail.courseSchedulesOnline).length > 0) {
      // Initialize from detail data
      const schedulesFromDetail = createScheduleFromDetail(detail.courseSchedulesOnline, "online")
      setSchedulesOnline(schedulesFromDetail)
    } else {
      // Initialize with default days
      const initialSchedulesOnline: DaySchedule[] = INITIAL_DAYS.map(day => ({
        day,
        timeSlots: [],
        isActive: false,
        isEditing: false,
        type: "online",
      }))
      setSchedulesOnline(initialSchedulesOnline)
    }
  }, [detail])

  useEffect(() => {
    if (detail?.courseSchedulesOffline && Object.keys(detail.courseSchedulesOffline).length > 0) {
      // Initialize from detail data
      const schedulesFromDetail = createScheduleFromDetail(detail.courseSchedulesOffline, "offline")
      setSchedulesOffline(schedulesFromDetail)
    } else {
      // Initialize with default days
      const initialSchedulesOffline: DaySchedule[] = INITIAL_DAYS.map(day => ({
        day,
        timeSlots: [],
        isActive: false,
        isEditing: false,
        type: "offline",
      }))
      setSchedulesOffline(initialSchedulesOffline)
    }
  }, [detail])

  // Watch classType for reactive updates
  const classType = form.watch("classType")
  const oneHourOnlinePrice = form.watch("oneHourOnlinePrice")
  const oneHourOfflinePrice = form.watch("oneHourOfflinePrice")

  // Field arrays for managing dynamic pricing packages
  const {
    fields: onlineFields,
    append: appendOnline,
    remove: removeOnline,
  } = useFieldArray({
    control: form.control,
    name: "coursePrices.online",
  })

  const {
    fields: offlineFields,
    append: appendOffline,
    remove: removeOffline,
  } = useFieldArray({
    control: form.control,
    name: "coursePrices.offline",
  })

  // Sync 1-hour prices with the first package entry
  useEffect(() => {
    const currentOnlinePrices = form.getValues("coursePrices.online")
    const currentOfflinePrices = form.getValues("coursePrices.offline")

    // Update online 1-hour package
    if (currentOnlinePrices.length > 0 && currentOnlinePrices[0].durationInHour === 1) {
      form.setValue(`coursePrices.online.0.price`, oneHourOnlinePrice || 0)
    }

    // Update offline 1-hour package
    if (currentOfflinePrices.length > 0 && currentOfflinePrices[0].durationInHour === 1) {
      form.setValue(`coursePrices.offline.0.price`, oneHourOfflinePrice || 0)
    }
  }, [oneHourOnlinePrice, oneHourOfflinePrice, form])

  // Schedule management functions
  const toggleScheduleEdit = (dayIndex: number, type: "online" | "offline") => {
    if (type === "online") {
      setSchedulesOnline(prev =>
        prev.map((schedule, index) =>
          index === dayIndex ? { ...schedule, isEditing: !schedule.isEditing } : schedule
        )
      )
    } else {
      setSchedulesOffline(prev =>
        prev.map((schedule, index) =>
          index === dayIndex ? { ...schedule, isEditing: !schedule.isEditing } : schedule
        )
      )
    }
  }

  const addTimeSlot = (dayIndex: number, type: "online" | "offline") => {
    const newTime = `${newTimeHour}:${newTimeMinute}`
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      time: newTime,
    }

    if (type === "online") {
      const schedule = schedulesOnline[dayIndex]
      if (schedule) {
        // Update local state
        setSchedulesOnline(prev =>
          prev.map((sched, index) =>
            index === dayIndex
              ? {
                  ...sched,
                  timeSlots: [...sched.timeSlots, newSlot],
                  isActive: true,
                }
              : sched
          )
        )

        // Update form data
        const currentSchedules = form.getValues("courseSchedulesOnline")
        const daySchedules = currentSchedules[schedule.day] || []
        const updatedSchedules = [
          ...daySchedules,
          { startTime: newTime, timezone: selectedTimezone },
        ]
        form.setValue(`courseSchedulesOnline.${schedule.day}`, updatedSchedules)
      }
    } else {
      const schedule = schedulesOffline[dayIndex]
      if (schedule) {
        // Update local state
        setSchedulesOffline(prev =>
          prev.map((sched, index) =>
            index === dayIndex
              ? {
                  ...sched,
                  timeSlots: [...sched.timeSlots, newSlot],
                  isActive: true,
                }
              : sched
          )
        )

        // Update form data
        const currentSchedules = form.getValues("courseSchedulesOffline")
        const daySchedules = currentSchedules[schedule.day] || []
        const updatedSchedules = [
          ...daySchedules,
          { startTime: newTime, timezone: selectedTimezone },
        ]
        form.setValue(`courseSchedulesOffline.${schedule.day}`, updatedSchedules)
      }
    }
  }

  const removeTimeSlot = (dayIndex: number, slotId: string, type: "online" | "offline") => {
    if (type === "online") {
      const schedule = schedulesOnline[dayIndex]
      if (schedule) {
        const updatedTimeSlots = schedule.timeSlots.filter(slot => slot.id !== slotId)

        // Update local state
        setSchedulesOnline(prev =>
          prev.map((sched, index) =>
            index === dayIndex
              ? {
                  ...sched,
                  timeSlots: updatedTimeSlots,
                  isActive: updatedTimeSlots.length > 0,
                }
              : sched
          )
        )

        // Update form data - rebuild the schedule array without the removed slot
        const currentSchedules = form.getValues("courseSchedulesOnline")
        const daySchedules = currentSchedules[schedule.day] || []

        // Find the slot index by matching time (since we don't store ID in form)
        const slotToRemove = schedule.timeSlots.find(slot => slot.id === slotId)
        if (slotToRemove) {
          const updatedDaySchedules = daySchedules.filter(
            formSlot => formSlot.startTime !== slotToRemove.time
          )

          if (updatedDaySchedules.length > 0) {
            form.setValue(`courseSchedulesOnline.${schedule.day}`, updatedDaySchedules)
          } else {
            // Remove the entire day if no schedules left
            const { [schedule.day]: _, ...remainingSchedules } = currentSchedules
            form.setValue("courseSchedulesOnline", remainingSchedules)
          }
        }
      }
    } else {
      const schedule = schedulesOffline[dayIndex]
      if (schedule) {
        const updatedTimeSlots = schedule.timeSlots.filter(slot => slot.id !== slotId)

        // Update local state
        setSchedulesOffline(prev =>
          prev.map((sched, index) =>
            index === dayIndex
              ? {
                  ...sched,
                  timeSlots: updatedTimeSlots,
                  isActive: updatedTimeSlots.length > 0,
                }
              : sched
          )
        )

        // Update form data - rebuild the schedule array without the removed slot
        const currentSchedules = form.getValues("courseSchedulesOffline")
        const daySchedules = currentSchedules[schedule.day] || []

        // Find the slot index by matching time (since we don't store ID in form)
        const slotToRemove = schedule.timeSlots.find(slot => slot.id === slotId)
        if (slotToRemove) {
          const updatedDaySchedules = daySchedules.filter(
            formSlot => formSlot.startTime !== slotToRemove.time
          )

          if (updatedDaySchedules.length > 0) {
            form.setValue(`courseSchedulesOffline.${schedule.day}`, updatedDaySchedules)
          } else {
            // Remove the entire day if no schedules left
            const { [schedule.day]: _, ...remainingSchedules } = currentSchedules
            form.setValue("courseSchedulesOffline", remainingSchedules)
          }
        }
      }
    }
  }

  const removeSchedule = (dayIndex: number, type: "online" | "offline") => {
    if (type === "online") {
      const schedule = schedulesOnline[dayIndex]
      if (schedule) {
        // Remove from form data first
        const currentSchedules = form.getValues("courseSchedulesOnline")
        const { [schedule.day]: _, ...remainingSchedules } = currentSchedules
        form.setValue("courseSchedulesOnline", remainingSchedules)

        // Then remove from local state array
        setSchedulesOnline(prev => prev.filter((_, index) => index !== dayIndex))
      }
    } else {
      const schedule = schedulesOffline[dayIndex]
      if (schedule) {
        // Remove from form data first
        const currentSchedules = form.getValues("courseSchedulesOffline")
        const { [schedule.day]: _, ...remainingSchedules } = currentSchedules
        form.setValue("courseSchedulesOffline", remainingSchedules)

        // Then remove from local state array
        setSchedulesOffline(prev => prev.filter((_, index) => index !== dayIndex))
      }
    }
  }

  // Add navigation state
  const [currentVisibleSection, setCurrentVisibleSection] = useState<number>(0)

  // Navigation component
  const FixedNavigation = () => {
    const sections = ["audience", "about", "pricing", "schedule"] as const

    const isFirstSection = currentVisibleSection === 0
    const isLastSection = currentVisibleSection === 3

    const handleNavigateToSection = (section: Section) => {
      const sectionIds: Record<Section, string> = {
        audience: "audience-top",
        about: "about-top",
        pricing: "pricing-top",
        schedule: "schedule-top",
      }

      const targetSection = document.getElementById(sectionIds[section])
      if (targetSection) {
        // Calculate offset to account for any fixed headers or spacing
        const offset = 100 // Adjust this value as needed
        const elementPosition = targetSection.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    }

    const handlePrevious = () => {
      if (!isFirstSection) {
        handleNavigateToSection(sections[currentVisibleSection - 1])
      }
    }

    const handleNext = () => {
      if (!isLastSection) {
        handleNavigateToSection(sections[currentVisibleSection + 1])
      }
    }

    return (
      <div className="fixed left-8 top-1/2 transform z-30 flex flex-col gap-4">
        {/* Up Arrow - Navigate to previous section (hidden on first section) */}
        {!isFirstSection && (
          <button
            type="button"
            onClick={handlePrevious}
            className="rounded-full xl:px-[12px] xl:py-[24px] px-2 py-4 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] bg-white hover:bg-gray-50 transition-colors"
            title={`Go to ${sections[currentVisibleSection - 1]} section`}
          >
            <div className="rotate-180">
              <ArrowIcon className="xl:size-6 size-4" />
            </div>
          </button>
        )}

        {/* Down Arrow - Navigate to next section (hidden on last section) */}
        {!isLastSection && (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full xl:px-[12px] xl:py-[24px] px-2 py-4 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] bg-white hover:bg-gray-50 transition-colors"
            title={`Go to ${sections[currentVisibleSection + 1]} section`}
          >
            <ArrowIcon className="xl:size-6 size-4" />
          </button>
        )}
      </div>
    )
  }

  // Add intersection observer for section detection
  useEffect(() => {
    const sectionIds = ["audience-top", "about-top", "pricing-top", "schedule-top"]

    const observer = new IntersectionObserver(
      entries => {
        // Find the entry with the highest intersection ratio that's actually intersecting
        const intersectingEntries = entries.filter(entry => entry.isIntersecting)

        if (intersectingEntries.length > 0) {
          // Sort by intersection ratio and position to get the most visible section
          const mostVisible = intersectingEntries.reduce((prev, current) => {
            const prevRatio = prev.intersectionRatio
            const currentRatio = current.intersectionRatio

            // If ratios are equal, prefer the one that's higher on screen (smaller boundingClientRect.top)
            if (Math.abs(prevRatio - currentRatio) < 0.1) {
              return prev.boundingClientRect.top < current.boundingClientRect.top ? prev : current
            }

            return prevRatio > currentRatio ? prev : current
          })

          const sectionIndex = sectionIds.indexOf(mostVisible.target.id)
          if (sectionIndex !== -1) {
            setCurrentVisibleSection(sectionIndex)
          }
        }
      },
      {
        root: null,
        rootMargin: "-80px 0px -60% 0px", // Adjusted for better mobile detection
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], // Multiple thresholds for better detection
      }
    )

    // Observe all sections
    sectionIds.forEach(id => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Fix the online channel checkbox logic
  const renderOnlineChannelCheckbox = (channel: string, field: any) => (
    <div key={channel} className="flex items-center space-x-2">
      <Checkbox
        id={`online-${channel.replace(/\s+/g, "-").toLowerCase()}`}
        checked={field.value?.includes(channel)}
        disabled={!classType.includes("Online")}
        onCheckedChange={checked => {
          if (checked) {
            field.onChange([...(field.value || []), channel])
          } else {
            field.onChange(field.value?.filter((c: string) => c !== channel))
          }
        }}
        className="border-main data-[state=checked]:bg-main data-[state=checked]:border-main"
      />
      <Label
        htmlFor={`online-${channel.replace(/\s+/g, "-").toLowerCase()}`}
        className="text-sm select-none"
      >
        {channel}
      </Label>
    </div>
  )

  const addNewSchedule = (type: "online" | "offline") => {
    const availableDays = DAYS_OF_WEEK.filter(day => {
      const schedules = type === "online" ? schedulesOnline : schedulesOffline
      return !schedules.some(schedule => schedule.day === day)
    })

    if (availableDays.length === 0) {
      // All days are already added
      return
    }

    // Add the first available day (you could show a picker instead)
    const newSchedule: DaySchedule = {
      day: availableDays[0],
      timeSlots: [],
      isActive: false,
      isEditing: true,
      type,
    }

    if (type === "online") {
      setSchedulesOnline(prev => [...prev, newSchedule])
    } else {
      setSchedulesOffline(prev => [...prev, newSchedule])
    }
  }

  // Add this useEffect to update existing schedules when timezone changes
  useEffect(() => {
    if (!selectedTimezone) return

    // Update all existing online schedules with new timezone
    const currentOnlineSchedules = form.getValues("courseSchedulesOnline")
    const updatedOnlineSchedules: typeof currentOnlineSchedules = {}

    Object.entries(currentOnlineSchedules).forEach(([day, timeSlots]) => {
      if (timeSlots && timeSlots.length > 0) {
        updatedOnlineSchedules[day] = timeSlots.map(slot => ({
          ...slot,
          timezone: selectedTimezone,
        }))
      }
    })

    // Update all existing offline schedules with new timezone
    const currentOfflineSchedules = form.getValues("courseSchedulesOffline")
    const updatedOfflineSchedules: typeof currentOfflineSchedules = {}

    Object.entries(currentOfflineSchedules).forEach(([day, timeSlots]) => {
      if (timeSlots && timeSlots.length > 0) {
        updatedOfflineSchedules[day] = timeSlots.map(slot => ({
          ...slot,
          timezone: selectedTimezone,
        }))
      }
    })

    // Update form values
    form.setValue("courseSchedulesOnline", updatedOnlineSchedules)
    form.setValue("courseSchedulesOffline", updatedOfflineSchedules)
  }, [selectedTimezone, form])

  return (
    <div>
      {/* Fixed Navigation Component */}
      <FixedNavigation />

      <Form {...form}>
        <form ref={formRef} className="p-6">
          {/* Audience Section */}
          {/* Update the anchor positioning */}
          {/* Audience Section */}
          <div className="relative min-h-screen">
            <div id="audience-top" className="absolute inset-x-0 -top-24" />{" "}
            {/* Changed from top-0 to -top-24 */}
            <section className="flex justify-center" id="audience">
              <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                <SectionTitleContent className="xl:w-[300px] w-full lg:h-fit" section="audience" />
                <div className="space-y-6 md:min-w-[560px] min-w-full">
                  <h3 className="text-2xl mb-10 font-bold">Tingkat dan Subjek/Mata pelajaran</h3>
                  <FormField
                    control={form.control}
                    name="levelEducationCourses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Pilih tingkat</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-y-3 gap-x-6">
                            <div className="flex flex-col gap-3">
                              {["TK", "SD", "SMP", "SMA"].map(grade => {
                                const id = `targetGrade-${grade.replace(/\s+/g, "-").toLowerCase()}`
                                return (
                                  <div key={grade} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={id}
                                      checked={field.value?.includes(grade)}
                                      onCheckedChange={checked => {
                                        if (checked) {
                                          field.onChange([...(field.value || []), grade])
                                        } else {
                                          field.onChange(field.value?.filter(g => g !== grade))
                                        }
                                      }}
                                      className="data-[state=checked]:bg-main border-main data-[state=checked]:border-main"
                                    />
                                    <Label htmlFor={id} className="text-sm select-none">
                                      {grade}
                                    </Label>
                                  </div>
                                )
                              })}
                            </div>
                            <div className="flex flex-col gap-3">
                              {["MI", "MTs", "MTA"].map(grade => {
                                const id = `targetGrade-${grade.replace(/\s+/g, "-").toLowerCase()}`
                                return (
                                  <div key={grade} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={id}
                                      checked={field.value?.includes(grade)}
                                      onCheckedChange={checked => {
                                        if (checked) {
                                          field.onChange([...(field.value || []), grade])
                                        } else {
                                          field.onChange(field.value?.filter(g => g !== grade))
                                        }
                                      }}
                                      className="data-[state=checked]:bg-main border-main data-[state=checked]:border-main"
                                    />
                                    <Label htmlFor={id} className="text-sm select-none">
                                      {grade}
                                    </Label>
                                  </div>
                                )
                              })}
                            </div>
                            <div className="flex flex-col gap-3">
                              {["SMK"].map(grade => {
                                const id = `targetGrade-${grade.replace(/\s+/g, "-").toLowerCase()}`
                                return (
                                  <div key={grade} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={id}
                                      checked={field.value?.includes(grade)}
                                      onCheckedChange={checked => {
                                        if (checked) {
                                          field.onChange([...(field.value || []), grade])
                                        } else {
                                          field.onChange(field.value?.filter(g => g !== grade))
                                        }
                                      }}
                                      className="data-[state=checked]:bg-main border-main data-[state=checked]:border-main"
                                    />
                                    <Label htmlFor={id} className="text-sm select-none">
                                      {grade}
                                    </Label>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courseCategoryID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Pilih subjek</FormLabel>
                        <FormControl>
                          <div className="w-full rounded-md border border-main px-3 py-1 bg-white focus:outline-none focus-visible:ring-main focus-visible:border-main">
                            <SearchableSelect<{ id: string; name: string }>
                              placeholder="Pilih Subjek"
                              icon={<SearchIcon />}
                              iconPosition="right"
                              value={searchCategoryValue}
                              showAllOnFocus
                              onChange={setSearchCategoryValue}
                              apiEndpoint="/api/v1/course-categories"
                              getDisplayText={category => category.name}
                              dropdownClassName="left-0 right-0 w-full"
                              renderItem={(category, _, isSelected) => (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={e => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setCategorySelected(category)
                                    setSearchCategoryValue(category.name)
                                    field.onChange(category.id)
                                    form.setValue("subCategoryIDs", [])
                                    setSubCategoryKey(prev => prev + 1)
                                    setSubCategoryHasMore(true)
                                    setSubCategoryOptions([])
                                  }}
                                  className={`w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-main-lighten-25 ${
                                    isSelected ? "bg-purple-100" : ""
                                  }`}
                                >
                                  <span className="text-gray-700">
                                    <span className="text-black font-medium">{category.name}</span>
                                  </span>
                                </button>
                              )}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subCategoryIDs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Pilih sub-subjek</FormLabel>
                        <FormControl>
                          <MultipleSelect
                            key={subCategoryKey}
                            options={subCategoryOptions}
                            value={field.value || []}
                            onLoadMore={async page => {
                              if (!categorySelected) {
                                setSubCategoryHasMore(false)
                                return []
                              }
                              try {
                                const response = await fetch(
                                  `/api/v1/course-categories/${categorySelected.id}/sub?page=${page}`,
                                  {
                                    next: { revalidate: 0 },
                                  }
                                )
                                const { data } = await response.json()
                                const newOptions =
                                  data?.map((item: { id: string; name: string }) => ({
                                    id: item.id,
                                    label: item.name,
                                  })) || []
                                setSubCategoryOptions(prev => {
                                  const ids = new Set(prev.map(opt => opt.id))
                                  const filtered = newOptions.filter(
                                    (opt: { id: string; name: string }) => !ids.has(opt.id)
                                  )
                                  return filtered.length > 0 ? [...prev, ...filtered] : prev
                                })
                                setSubCategoryHasMore(newOptions.length === 20)
                                return newOptions
                              } catch (_error) {
                                setSubCategoryHasMore(false)
                                return []
                              }
                            }}
                            onSelectionChange={selectedIds => {
                              field.onChange(selectedIds)
                            }}
                            hasMore={subCategoryHasMore}
                            pageSize={20}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* About Section */}
          {/* About Section */}
          <div className="relative min-h-screen">
            <div id="about-top" className="absolute inset-x-0 -top-24" />{" "}
            {/* Changed from top-0 to -top-24 */}
            <section className="flex justify-center" id="about">
              <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                <SectionTitleContent className="lg:w-[300px] w-full lg:h-fit" section="about" />
                <div className="space-y-6 md:min-w-[560px] min-w-full">
                  <h3 className="text-2xl mb-10 font-bold">Tentang Course dan Tutor</h3>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Judul Course</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              rows={8}
                              maxLength={150}
                              className="min-h-32 border-main focus-visible:ring-main focus-visible:border-main focus-visible:ring-0"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                              {field.value?.length || 0}/150
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Tentang Course</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              rows={20}
                              maxLength={150}
                              className="min-h-96 border-main focus-visible:ring-main focus-visible:border-main focus-visible:ring-0"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                              {field.value?.length || 0}/150
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tutorDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Tentang Tutor</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              rows={20}
                              maxLength={150}
                              className="min-h-96 border-main focus-visible:ring-main focus-visible:border-main focus-visible:ring-0"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                              {field.value?.length || 0}/150
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Pricing Section */}
          {/* Pricing Section */}
          <div className="relative min-h-screen mt-24">
            <div id="pricing-top" className="absolute inset-x-0 -top-24" />{" "}
            {/* Changed from top-0 to -top-24 */}
            <section className="flex justify-center" id="pricing">
              <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                <SectionTitleContent className="lg:w-[300px] w-full lg:h-fit" section="pricing" />
                <div className="space-y-6 md:min-w-[560px] min-w-full">
                  <h3 className="text-2xl mb-4 font-bold">Tentang Course dan Tutor</h3>
                  <div className="flex md:flex-row flex-col gap-6">
                    <div className="pr-6 border-r-0 md:border-r border-main">
                      <p className="font-bold mb-3">Tipe Course</p>
                      <FormField
                        control={form.control}
                        name={"classType" as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center space-x-3 mb-4">
                                <Checkbox
                                  id="online"
                                  checked={field.value?.includes("Online")}
                                  onCheckedChange={checked => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), "Online"])
                                    } else {
                                      const newVal = field.value?.filter(
                                        (g: string) => g !== "Online"
                                      )
                                      field.onChange(newVal)
                                      // reset onlineChannel if "Online" is unchecked
                                      form.setValue("onlineChannel", [])
                                    }
                                  }}
                                  className="border-main data-[state=checked]:bg-main data-[state=checked]:border-main"
                                />
                                <Label htmlFor="online" className="text-lg font-bold select-none">
                                  ONLINE
                                </Label>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="ml-8 mb-4">
                        <FormField
                          control={form.control}
                          name="onlineChannel"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex flex-col gap-4">
                                  {ONLINE_CHANNELS.map(channel =>
                                    renderOnlineChannelCheckbox(channel, field)
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={"classType" as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center space-x-3 mb-4">
                                <Checkbox
                                  id="Offline"
                                  checked={field.value?.includes("Offline")}
                                  onCheckedChange={checked => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), "Offline"])
                                    } else {
                                      field.onChange(
                                        field.value?.filter((g: string) => g !== "Offline")
                                      )
                                    }
                                  }}
                                  className="border-main data-[state=checked]:bg-main data-[state=checked]:border-main"
                                />
                                <Label htmlFor="Offline" className="text-lg font-bold select-none">
                                  OFFLINE
                                </Label>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <p className="font-bold">Tarif Course</p>
                        {/* 1-hour pricing input */}
                        <FormField
                          control={form.control}
                          name="oneHourOnlinePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-main">ONLINE</FormLabel>
                              <FormControl>
                                <CurrencyIdrInput
                                  value={field.value || 0}
                                  onChange={field.onChange}
                                  placeholder="Rp XXXXX"
                                  className="border-main placeholder:text-main-lighten-25 focus-visible:ring-main focus-visible:border-main"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Package pricing */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold mb-4">Package</h4>
                          <div className="space-y-3">
                            {onlineFields
                              .filter(
                                field =>
                                  form.getValues(
                                    `coursePrices.online.${onlineFields.indexOf(field)}.durationInHour`
                                  ) !== 1
                              )
                              .map(field => {
                                const index = onlineFields.indexOf(field)
                                return (
                                  <div key={field.id} className="flex gap-4 items-end">
                                    <FormField
                                      control={form.control}
                                      name={`coursePrices.online.${index}.durationInHour`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs font-bold text-main">
                                            DURASI
                                          </FormLabel>
                                          <FormControl>
                                            <Select
                                              value={field.value?.toString() || ""}
                                              onValueChange={val => field.onChange(parseInt(val))}
                                            >
                                              <SelectTrigger
                                                iconClassName="text-white opacity-100"
                                                className="bg-main text-white border-main focus-visible:ring-main focus-visible:border-main"
                                              >
                                                <SelectValue placeholder="Pilih durasi" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {DURATION_OPTIONS.map(duration => (
                                                  <SelectItem
                                                    key={duration}
                                                    value={duration.toString()}
                                                  >
                                                    {duration} jam
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`coursePrices.online.${index}.price`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormLabel className="text-xs font-bold text-main">
                                            TARIF
                                          </FormLabel>
                                          <FormControl>
                                            <CurrencyIdrInput
                                              value={field.value || 0}
                                              onChange={field.onChange}
                                              placeholder="Rp XXXXX"
                                              className="border-main placeholder:text-main-lighten-25 focus-visible:ring-main focus-visible:border-main"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        removeOnline(index)
                                      }}
                                    >
                                      <RemoveIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )
                              })}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                appendOnline({ durationInHour: 2, price: 0 })
                              }}
                              className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <p className="invisible font-bold">Tarif Course</p>
                        {/* 1-hour pricing input */}
                        <FormField
                          control={form.control}
                          name="oneHourOfflinePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-main">OFFLINE</FormLabel>
                              <FormControl>
                                <CurrencyIdrInput
                                  value={field.value || 0}
                                  onChange={field.onChange}
                                  placeholder="Rp XXXXX"
                                  className="border-main placeholder:text-main-lighten-25 focus-visible:ring-main focus-visible:border-main"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Package pricing */}
                        <div className="space-y-4">
                          <h4 className="invisible text-lg font-semibold mb-4">Package</h4>
                          <div className="space-y-3">
                            {offlineFields
                              .filter(
                                field =>
                                  form.getValues(
                                    `coursePrices.offline.${offlineFields.indexOf(field)}.durationInHour`
                                  ) !== 1
                              )
                              .map(field => {
                                const index = offlineFields.indexOf(field)
                                return (
                                  <div key={field.id} className="flex items-end gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`coursePrices.offline.${index}.durationInHour`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs font-bold text-main">
                                            DURASI
                                          </FormLabel>
                                          <FormControl>
                                            <Select
                                              value={field.value?.toString() || ""}
                                              onValueChange={val => field.onChange(parseInt(val))}
                                            >
                                              <SelectTrigger
                                                iconClassName="text-white opacity-100"
                                                className="bg-main text-white border-main focus-visible:ring-main focus-visible:border-main"
                                              >
                                                <SelectValue placeholder="Pilih durasi" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {DURATION_OPTIONS.map(duration => (
                                                  <SelectItem
                                                    key={duration}
                                                    value={duration.toString()}
                                                  >
                                                    {duration} jam
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`coursePrices.offline.${index}.price`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormLabel className="text-xs font-bold text-main">
                                            TARIF
                                          </FormLabel>
                                          <FormControl>
                                            <CurrencyIdrInput
                                              value={field.value || 0}
                                              onChange={field.onChange}
                                              placeholder="0"
                                              className="border-main focus-visible:ring-main focus-visible:border-main"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        removeOffline(index)
                                      }}
                                    >
                                      <RemoveIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )
                              })}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                appendOffline({ durationInHour: 2, price: 0 })
                              }}
                              className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-24 flex justify-center">
                    <FormField
                      control={form.control}
                      name="isFreeFirstCourse"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="isFreeFirstCourse"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-main data-[state=checked]:bg-main data-[state=checked]:border-main"
                              />
                              <Label htmlFor="isFreeFirstCourse" className="tex-xs">
                                Aktifkan label{" "}
                                <span className="font-bold">Sesi Pertama Gratis</span>
                              </Label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Schedule Section */}
          <div className="relative min-h-screen">
            <div id="schedule-top" className="absolute inset-x-0 -top-24" />{" "}
            {/* Changed from top-0 to -top-24 */}
            <section className="flex justify-center" id="schedule">
              <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                <SectionTitleContent className="lg:w-[300px] w-full lg:h-fit" section="schedule" />
                <div className="space-y-6 md:min-w-[560px] min-w-full">
                  <h3 className="text-2xl mb-4 font-bold">Availability Schedule</h3>
                  <div className="flex md:flex-row flex-col gap-6">
                    <div className="pr-6">
                      <p className="font-bold mb-3">Zona Waktu</p>
                      <RadioGroup
                        value={selectedTimezone}
                        onValueChange={setSelectedTimezone}
                        className="flex flex-col gap-4"
                      >
                        {TIMEZONE.map(time => (
                          <div key={time} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={time}
                              id={`timezone-${time.replace(/\s+/g, "-").toLowerCase()}`}
                              className="border-main data-[state=checked]:border-main data-[state=checked]:text-main"
                            />
                            <Label
                              htmlFor={`timezone-${time.replace(/\s+/g, "-").toLowerCase()}`}
                              className="text-sm select-none cursor-pointer"
                            >
                              {time}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="border-r-0 md:border-r border-main max-h-[300px]" />
                    <div className="pr-6">
                      <p className="font-bold mb-3">Online</p>
                      <div className="flex-1 space-y-4">
                        {schedulesOnline.map((schedule, index) => (
                          <Card
                            key={schedule.day}
                            className={`p-2 min-w-[280px] bg-white rounded-2xl shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] transition-all hover:border-gray-300 ${schedule.isEditing ? "border-main hover:border-main" : ""}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col gap-3">
                                <h3 className="text-lg font-bold text-main">{schedule.day}</h3>
                                {schedule.isEditing ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Select value={newTimeHour} onValueChange={setNewTimeHour}>
                                        <SelectTrigger className="w-24 border-main focus:border-main">
                                          <SelectValue placeholder="00" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 24 }, (_, i) => (
                                            <SelectItem
                                              key={i}
                                              value={i.toString().padStart(2, "0")}
                                            >
                                              {i.toString().padStart(2, "0")}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <span className="text-main font-medium">:</span>
                                      <Select
                                        value={newTimeMinute}
                                        onValueChange={setNewTimeMinute}
                                      >
                                        <SelectTrigger className="w-24 border-main focus:border-main">
                                          <SelectValue placeholder="00" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="00">00</SelectItem>
                                          <SelectItem value="15">15</SelectItem>
                                          <SelectItem value="30">30</SelectItem>
                                          <SelectItem value="45">45</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        type="button"
                                        size="sm"
                                        className="ml-auto bg-[#8E8E8E] hover:bg-gray-600 text-white rounded-lg w-8 h-8 p-0"
                                        onClick={e => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          addTimeSlot(index, "online")
                                        }}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {schedule.timeSlots.map(slot => (
                                        <div key={slot.id} className="w-full">
                                          <Button
                                            type="button"
                                            className="relative group bg-main hover:bg-main text-white px-6 py-2 rounded-xl font-medium w-full"
                                          >
                                            <span className="inline-block transition-opacity duration-150 group-hover:opacity-0">
                                              {slot.time}
                                            </span>
                                            <span
                                              onClick={() =>
                                                removeTimeSlot(index, slot.id, "online")
                                              }
                                              className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 cursor-pointer"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                                aria-hidden
                                              >
                                                <path
                                                  d="M4 4L12 12"
                                                  stroke="white"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                                <path
                                                  d="M12 4L4 12"
                                                  stroke="white"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </span>
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2">
                                    {schedule.timeSlots.length === 0 ? (
                                      <p className="text-gray-500 italic">No time slots added</p>
                                    ) : (
                                      schedule.timeSlots.map(slot => (
                                        <Button
                                          key={slot.id}
                                          type="button"
                                          variant="secondary"
                                          className="bg-[#B4B4B4] hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium"
                                        >
                                          {slot.time}
                                        </Button>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                {!schedule.isEditing ? (
                                  <>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-main hover:text-main"
                                      onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        toggleScheduleEdit(index, "online")
                                      }}
                                    >
                                      <SquarePen className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-400 hover:text-red-500"
                                      onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        removeSchedule(index, "online")
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="lg"
                                    className="cursor-pointer"
                                    onClick={e => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      toggleScheduleEdit(index, "online")
                                    }}
                                  >
                                    <Check className="w-12 h-12 text-main" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            addNewSchedule("online")
                          }}
                          className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="border-r-0 md:border-r border-main max-h-[300px]" />
                    <div className="pr-6">
                      <p className="font-bold mb-3">Offline</p>
                      <div className="flex-1 space-y-4">
                        {schedulesOffline.map((schedule, index) => (
                          <Card
                            key={schedule.day}
                            className={`p-2 min-w-[280px] bg-white rounded-2xl shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] transition-all hover:border-gray-300 ${schedule.isEditing ? "border-main hover:border-main" : ""}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col gap-3">
                                <h3 className="text-lg font-bold text-main">{schedule.day}</h3>
                                {schedule.isEditing ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Select value={newTimeHour} onValueChange={setNewTimeHour}>
                                        <SelectTrigger className="w-24 border-main focus:border-main">
                                          <SelectValue placeholder="00" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 24 }, (_, i) => (
                                            <SelectItem
                                              key={i}
                                              value={i.toString().padStart(2, "0")}
                                            >
                                              {i.toString().padStart(2, "0")}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <span className="text-main font-medium">:</span>
                                      <Select
                                        value={newTimeMinute}
                                        onValueChange={setNewTimeMinute}
                                      >
                                        <SelectTrigger className="w-24 border-main focus:border-main">
                                          <SelectValue placeholder="00" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="00">00</SelectItem>
                                          <SelectItem value="15">15</SelectItem>
                                          <SelectItem value="30">30</SelectItem>
                                          <SelectItem value="45">45</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        type="button"
                                        size="sm"
                                        className="ml-auto bg-[#8E8E8E] hover:bg-gray-600 text-white rounded-lg w-8 h-8 p-0"
                                        onClick={e => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          addTimeSlot(index, "offline")
                                        }}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {schedule.timeSlots.map(slot => (
                                        <div key={slot.id} className="w-full">
                                          <Button
                                            key={slot.id}
                                            type="button"
                                            className="relative group w-full bg-main hover:bg-main text-white px-6 py-2 rounded-xl font-medium"
                                          >
                                            <span className="inline-block transition-opacity duration-150 group-hover:opacity-0">
                                              {slot.time}
                                            </span>
                                            <span
                                              onClick={() =>
                                                removeTimeSlot(index, slot.id, "offline")
                                              }
                                              className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 cursor-pointer"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                                aria-hidden
                                              >
                                                <path
                                                  d="M4 4L12 12"
                                                  stroke="white"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                                <path
                                                  d="M12 4L4 12"
                                                  stroke="white"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </span>
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2">
                                    {schedule.timeSlots.length === 0 ? (
                                      <p className="text-gray-500 italic">No time slots added</p>
                                    ) : (
                                      schedule.timeSlots.map(slot => (
                                        <Button
                                          key={slot.id}
                                          type="button"
                                          variant="secondary"
                                          className="bg-[#B4B4B4] hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium"
                                        >
                                          {slot.time}
                                        </Button>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                {!schedule.isEditing ? (
                                  <>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-main hover:text-main"
                                      onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        toggleScheduleEdit(index, "offline")
                                      }}
                                    >
                                      <SquarePen className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-400 hover:text-red-500"
                                      onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        removeSchedule(index, "offline")
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="lg"
                                    className="cursor-pointer"
                                    onClick={e => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      toggleScheduleEdit(index, "offline")
                                    }}
                                  >
                                    <Check className="w-12 h-12 text-main" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            addNewSchedule("offline")
                          }}
                          className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </form>
      </Form>
    </div>
  )
}
