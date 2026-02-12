import { createTutor } from "@/services/tutor";
import { TutorForm } from "@/components/tutor/tutor-form";

export default function CreateTutorPage() {
    return <TutorForm action={createTutor} />;
}
