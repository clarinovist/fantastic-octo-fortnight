const { z } = require("zod");

const courseWizardSchema = z.object({
    title: z.string().min(1, "Course title is required"),
    description: z.string().default(""),
    courseCategoryID: z.string().min(1, "Category is required"),
    subCategoryIDs: z.array(z.string()).default([]),
    levelEducationCourses: z.array(z.string()).default([]),
    tutorId: z.string().default(""),
    classType: z.array(z.string()).min(1, "Select at least one class type"),
    coursePrices: z.object({
        offline: z.array(z.object({
            durationInHour: z.number().min(0),
            price: z.number().min(0),
        })).default([]),
        online: z.array(z.object({
            durationInHour: z.number().min(0),
            price: z.number().min(0),
        })).default([]),
    }),
    isFreeFirstCourse: z.boolean().default(false),
    onlineChannel: z.array(z.string()).default([]),
    courseSchedulesOffline: z.record(z.string(), z.array(z.object({
        startTime: z.string(),
        timezone: z.string(),
    }))).default({}),
    courseSchedulesOnline: z.record(z.string(), z.array(z.object({
        startTime: z.string(),
        timezone: z.string(),
    }))).default({}),
});

const payload = {
    title: "English",
    description: "",
    courseCategoryID: "123",
    subCategoryIDs: [],
    levelEducationCourses: [],
    tutorId: "123",
    classType: ["Online"], // Default
    coursePrices: {
        offline: [{ durationInHour: 1, price: 0 }],
        online: [{ durationInHour: 1, price: 0 }],
    },
    isFreeFirstCourse: true,
    onlineChannel: [],
    courseSchedulesOffline: {},
    courseSchedulesOnline: {},
};

try {
    courseWizardSchema.parse(payload);
    console.log("Success");
} catch (e) {
    console.log(JSON.stringify(e.errors, null, 2));
}
