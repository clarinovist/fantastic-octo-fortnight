"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getMentorStudents, getMentorCourses, createSession } from "@/services/mentor";
import { MapField } from "@/components/ui/map-field";
import useSWR from "swr";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
    student_id: z.string().min(1, "Pilih siswa terlebih dahulu"),
    course_id: z.string().min(1, "Pilih mata pelajaran"),
    booking_date: z.string().min(1, "Tanggal wajib diisi"),
    booking_time: z.string().min(1, "Jam mulai wajib diisi"),
    class_type: z.enum(["online", "offline"]),
    duration_minutes: z.coerce.number().min(30, "Durasi minimal 30 menit"),
    notes: z.string().optional(),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
    }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateSessionDialog({ open, onOpenChange, onSuccess }: CreateSessionDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { data: studentsData } = useSWR("/mentor/students", getMentorStudents);
    const { data: coursesData } = useSWR("/mentor/courses", () => getMentorCourses());

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            student_id: "",
            course_id: "",
            booking_date: "",
            booking_time: "",
            class_type: "online",
            duration_minutes: 60,
            notes: "",
            location: undefined,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            await createSession({
                ...values,
                latitude: values.location?.lat,
                longitude: values.location?.lng,
            });
            toast.success("Sesi berhasil dibuat");
            onOpenChange(false);
            onSuccess?.();
            form.reset();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Gagal membuat sesi.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const classType = form.watch("class_type");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buat Sesi Baru</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="student_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pilih Siswa</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Cari nama siswa..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {studentsData?.data?.map((student) => (
                                                <SelectItem key={student.student_id} value={student.student_id}>
                                                    {student.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="course_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mata Pelajaran</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih mata pelajaran" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {coursesData?.data?.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="booking_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tanggal Sesi</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="booking_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Jam Mulai</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="duration_minutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Durasi Sesi</FormLabel>
                                    <div className="flex gap-3">
                                        {[60, 90, 120].map((duration) => (
                                            <button
                                                key={duration}
                                                type="button"
                                                onClick={() => field.onChange(duration)}
                                                className={`flex-1 py-2 text-sm font-medium border rounded-lg transition-colors ${field.value === duration
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-input hover:border-primary/50 text-muted-foreground"
                                                    }`}
                                            >
                                                {duration} Menit
                                            </button>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="class_type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Tipe Kelas</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="online" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Online
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="offline" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Offline
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {classType === "offline" && (
                            <MapField
                                name="location"
                                label="Lokasi Pertemuan"
                                description="Cari lokasi pertemuan atau pilih di peta"
                                required
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Catatan (Opsional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tambahkan instruksi atau materi yang akan dibahas..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Sesi
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
