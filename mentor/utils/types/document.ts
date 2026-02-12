export interface TutorDocument {
    id: string;
    tutor_id: string;
    name: string;
    url: string;
    type: string; // "ktp", "ijazah", "sertifikat", "lainnya"
    created_at: string;
}

export interface UploadDocumentRequest {
    name: string;
    type: string;
    file: string; // base64
}
