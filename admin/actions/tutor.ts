"use server"

import type { TutorSubmitPayload } from "@/components/tutor/tutor-form"
import { changeDocumentStatus, changeRoleTutor, changeTutorStatus, createTutor, deleteTutorReview, deleteTutors, updateTutor, updateTutorReview, uploadTutorDocument } from "@/services/tutor"
import { updateTag } from "next/cache"

export async function createTutorAction(payload: TutorSubmitPayload) {
  const result = await createTutor(payload)
  if (result.success) {
    updateTag("tutors")
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to create tutor"
    }
  }
}
export async function updateTutorAction(id: string, payload: TutorSubmitPayload) {
  const result = await updateTutor(id, payload)
  if (result.success) {
    updateTag("tutors")
    updateTag(`tutor-${id}`)
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to update tutor"
    }
  }
}

export async function deleteTutorAction(ids: string[]) {
  const result = await deleteTutors(ids)
  if (result.success) {
    updateTag("tutors")
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to delete tutors"
    }
  }
}

export async function changeRoleTutorAction(id: string) {
  const result = await changeRoleTutor(id)
  if (result.success) {
    updateTag("tutors")
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to change tutor role"
    }
  }
}

export async function changeTutorStatusAction(id: string, status: 'active' | 'inactive') {
  const result = await changeTutorStatus(id, status)
  if (result.success) {
    updateTag("tutors")
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to change tutor status"
    }
  }
}

export async function changeDocumentStatusAction(tutorId: string, documentId: string, status: 'active' | 'inactive') {
  const result = await changeDocumentStatus(tutorId, documentId, status)
  if (result.success) {
    updateTag(`tutor-documents`)
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to change document status"
    }
  }
}

export async function uploadTutorDocumentAction(payload: { url: string; tutorId: string }) {
  const result = await uploadTutorDocument(payload.url, payload.tutorId)
  if (result.success) {
    updateTag(`tutor-documents`)
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to upload tutor document"
    }
  }
}

export async function updateTutorReviewAction(payload: { id: string; review: string; rate: string; recommendByStudent: "yes" | "no" | null }) {
  const result = await updateTutorReview(payload.id, payload.review, Number(payload.rate), payload.recommendByStudent)
  if (result.success) {
    updateTag(`tutor`)
    updateTag('student')
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to update tutor review"
    }
  }
}

export async function deleteTutorReviewAction(reviewId: string) {
  const result = await deleteTutorReview(reviewId)
  if (result.success) {
    updateTag(`tutor`)
    updateTag('student')
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to delete tutor review"
    }
  }
}
