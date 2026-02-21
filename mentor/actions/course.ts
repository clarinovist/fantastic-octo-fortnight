"use server"

import { revalidateTag } from "next/cache";
import {
    publishCourse,
    deleteCourse,
    submitCourse,
    createCourse,
    updateCourse
} from "@/services/course";
import { CoursePayload } from "@/utils/types/course";

export async function publishCourseAction(id: string, isPublished: boolean) {
    try {
        const res = await publishCourse(id, isPublished);
        revalidateTag("courses", "default");
        return res;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function deleteCourseAction(id: string) {
    try {
        const res = await deleteCourse(id);
        revalidateTag("courses", "default");
        return res;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function submitCourseAction(id: string) {
    try {
        const res = await submitCourse(id);
        revalidateTag("courses", "default");
        return res;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function createCourseAction(data: CoursePayload) {
    try {
        const res = await createCourse(data);
        console.log("SERVER ACTION createCourse RES:", res);
        revalidateTag("courses", "default");
        return res;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function updateCourseAction(id: string, data: CoursePayload) {
    try {
        const res = await updateCourse(id, data);
        console.log("SERVER ACTION updateCourse RES:", res);
        revalidateTag("courses", "default");
        return res;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
