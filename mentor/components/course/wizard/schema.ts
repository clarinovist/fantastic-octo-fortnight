import * as z from "zod"

export const wizardFormSchema = z.object({
    classType: z.array(z.string()).min(1, "Pilih minimal satu tipe kelas"),
    courseCategoryID: z.string().min(1, "Pilih subjek utama"),
    coursePrices: z.object({
        offline: z.array(z.object({
            durationInHour: z.number(),
            price: z.number()
        })),
        online: z.array(z.object({
            durationInHour: z.number(),
            price: z.number()
        }))
    }),
    courseSchedulesOffline: z.record(z.string(), z.array(z.object({
        startTime: z.string(),
        timezone: z.string()
    }))),
    courseSchedulesOnline: z.record(z.string(), z.array(z.object({
        startTime: z.string(),
        timezone: z.string()
    }))),
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    isFreeFirstCourse: z.boolean(),
    levelEducationCourses: z.array(z.string()).min(1, "Pilih minimal satu tingkat"),
    onlineChannel: z.array(z.string()),
    subCategoryIDs: z.array(z.string()).min(1, "Pilih minimal satu sub-subjek"),
    title: z.string().min(5, "Judul minimal 5 karakter"),
    tutorDescription: z.string().min(10, "Deskripsi tutor minimal 10 karakter"),
    oneHourOnlinePrice: z.number().optional(),
    oneHourOfflinePrice: z.number().optional(),
    courseCategoryName: z.string().optional(),
    subCategoryNames: z.array(z.string()).optional(),
})

export type CourseWizardData = z.infer<typeof wizardFormSchema>
