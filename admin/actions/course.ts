"use server"

import { approveCourse, createCourse, deleteCourse, rejectCourse, updateCourse, type CreateCoursePayload } from "@/services/course"
import type { CoursePayload } from "@/utils/types/course"
import { updateTag } from "next/cache"

export async function updateCourseAction(id: string, payload: CoursePayload) {
  try {
    const result = await updateCourse(id, payload)

    if (!result.success) {
      console.error("Failed to update course:", result)
      return {
        success: false,
        error: result.message || result.error || "Failed to update course"
      }
    }

    updateTag("courses")
    updateTag("course")
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Failed to update course:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update course"
    }
  }
}

export async function approveCourseAction(id: string, reviewNotes: string) {
  try {
    const result = await approveCourse(id, reviewNotes)

    if (!result.success) {
      console.error("Failed to approve course:", result)
      return {
        success: false,
        error: result.message || result.error || "Failed to approve course"
      }
    }
<<<<<<< HEAD

    console.log("Course approved successfully:", result)
=======
>>>>>>> 1a19ced (chore: update service folders from local)
    updateTag("courses")
    updateTag("course")
    return { success: true }
  } catch (error) {
    console.error("Failed to approve course:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve course"
    }
  }
}

export async function rejectCourseAction(id: string, reviewNotes: string) {
  try {
    const result = await rejectCourse(id, reviewNotes)

    if (!result.success) {
      console.error("Failed to reject course:", result)
      return {
        success: false,
        error: result.message || result.error || "Failed to reject course"
      }
    }
<<<<<<< HEAD

    console.log("Course rejected successfully:", result)
=======
>>>>>>> 1a19ced (chore: update service folders from local)
    updateTag("courses")
    updateTag("course")
    return { success: true }
  } catch (error) {
    console.error("Failed to reject course:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject course"
    }
  }
}

export async function createCourseAction(payload: CreateCoursePayload) {
  try {
    const result = await createCourse(payload)

    if (!result.success) {
      console.error("Failed to create course:", result)
      return {
        success: false,
        error: result.message || result.error || "Failed to create course"
      }
    }
<<<<<<< HEAD

    console.log("Course created successfully:", result)
=======
>>>>>>> 1a19ced (chore: update service folders from local)
    updateTag("courses")
    updateTag("course")
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Failed to create course:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create course"
    }
  }
}

export async function deleteCourseAction(id: string) {
  try {
    const result = await deleteCourse(id)

    if (!result.success) {
      console.error("Failed to delete course:", result)
      return {
        success: false,
        error: result.message || result.error || "Failed to delete course"
      }
    }
<<<<<<< HEAD

    console.log("Course deleted successfully:", result)
=======
>>>>>>> 1a19ced (chore: update service folders from local)
    updateTag("courses")
    updateTag("course")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete course:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete course"
    }
  }
}
