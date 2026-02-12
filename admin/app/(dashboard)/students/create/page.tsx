import { createStudent } from "@/services/student";
import { StudentForm } from "@/components/student/student-form";

export default function CreateStudentPage() {
    return (
        <div className="flex-1 w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <StudentForm action={createStudent} />
        </div>
    );
}
