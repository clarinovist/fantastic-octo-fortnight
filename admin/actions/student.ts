"use server"

import type { StudentSubmitPayload } from "@/components/student/student-form"
import { changeRoleStudent, createStudent, deleteStudentReview, deleteStudents, updateStudent, updateStudentReview } from "@/services/student"
import { updateTag } from "next/cache"

export async function createStudentAction(payload: StudentSubmitPayload) {
  const result = await createStudent(payload)
  if (result.success) {
    updateTag("students")
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to create student"
    }
  }
}
export async function updateStudentAction(id: string, payload: StudentSubmitPayload) {
  const result = await updateStudent(id, payload)
  if (result.success) {
    updateTag("students")
    updateTag(`student-${id}`)
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to update student"
    }
  }
}

export async function deleteStudentAction(ids: string[]) {
  const result = await deleteStudents(ids)
  if (result.success) {
    updateTag("students")
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to delete students"
    }
  }
}

export async function changeRoleStudentAction(id: string) {
  const result = await changeRoleStudent(id)
  if (result.success) {
    updateTag("students")
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to change student role"
    }
  }
}

export async function updateStudentReviewAction(payload: { id: string; review: string; rate: string; recommendByStudent: "yes" | "no" | null }) {
  const result = await updateStudentReview(payload.id, payload.review, Number(payload.rate), payload.recommendByStudent)
  if (result.success) {
    updateTag(`tutor`)
    updateTag('student')
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to update student review"
    }
  }
}

export async function deleteStudentReviewAction(reviewId: string) {
  const result = await deleteStudentReview(reviewId)
  if (result.success) {
    updateTag(`tutor`)
    updateTag('student')
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to delete student review"
    }
  }
}
