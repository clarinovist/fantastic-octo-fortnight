"use client";

import useSWR from "swr";
import { getProfile, changePassword } from "@/services/auth";
import { getMentorStudents } from "@/services/mentor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useState, useRef } from "react";
import {
    Camera,
    Edit,
    User,
    Mail,
    Phone,
    MapPin,
    Users,
    BookOpen,
    Star,
    ExternalLink,
    LockKeyhole,
    Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { uploadPhotoAction } from "@/actions/profile";

export default function ProfilePage() {
    const { data: profileRes, isLoading: isLoadingProfile, mutate: mutateProfile } = useSWR("/v1/me", getProfile);
    const { data: studentsRes } = useSWR("/v1/mentor/students", getMentorStudents);

    const [isEditingMode, setIsEditingMode] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const profile = profileRes?.data;
    const studentsCount = studentsRes?.data?.length || 0;

    const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const currentPassword = formData.get("current-password") as string;
        const newPassword = formData.get("new-password") as string;
        const confirmPassword = formData.get("confirm-password") as string;

        if (newPassword !== confirmPassword) {
            toast.error("Password baru dan konfirmasi password tidak cocok");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password baru minimal 8 karakter");
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await changePassword({
                oldPassword: currentPassword,
                newPassword: newPassword,
            });
            if (res.success) {
                toast.success("Password berhasil diperbarui!");
                (e.target as HTMLFormElement).reset();
            } else {
                toast.error(res.message || "Gagal memperbarui password");
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("File harus berupa gambar (JPG, PNG, dll)");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 5MB");
            return;
        }

        setIsUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await uploadPhotoAction(formData);
            if (res.success) {
                toast.success("Foto profil berhasil diperbarui!");
                mutateProfile();
            } else {
                toast.error("Gagal mengupload foto");
            }
        } catch {
            toast.error("Terjadi kesalahan saat mengupload foto");
        } finally {
            setIsUploadingPhoto(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground mt-2">Memuat profil...</p>
            </div>
        );
    }

    return (
        <>
            <PageHeader breadcrumbs={[{ label: "Profil Saya" }]} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Hero Profile Card */}
                    <Card className="overflow-hidden">
                        {/* Banner */}
                        <div className="h-40 bg-violet-50 dark:bg-violet-600/20 w-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-transparent" />
                        </div>
                        {/* Profile Info */}
                        <div className="px-6 pb-6">
                            <div className="flex flex-col sm:flex-row items-end -mt-12 sm:-mt-16 relative">
                                {/* Avatar */}
                                <div className="relative">
                                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-background shadow-md">
                                        <AvatarImage src={profile?.photo_profile || `https://avatar.vercel.sh/${profile?.email || 'mentor'}`} alt="Profile" />
                                        <AvatarFallback className="text-2xl bg-violet-100 text-violet-600">
                                            {profile?.name?.substring(0, 2).toUpperCase() || "BS"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingPhoto}
                                        className="absolute bottom-0 right-0 bg-background text-muted-foreground p-1.5 rounded-full shadow-md border hover:text-violet-600 transition-colors disabled:opacity-50"
                                    >
                                        {isUploadingPhoto ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Camera className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {/* Name & Details */}
                                <div className="mt-4 sm:mt-0 sm:ml-5 flex-1 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                        <h1 className="text-2xl font-bold">{profile?.name || "Profil Belum Lengkap"}</h1>
                                        {profile?.name && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                ✓ Tutor Terverifikasi
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{profile?.email || "Tambah data diri Anda agar bisa membuat kelas"}</p>
                                </div>
                                {/* Action Button */}
                                <div className="mt-4 sm:mt-0 flex-shrink-0 w-full sm:w-auto">
                                    {!isEditingMode && (
                                        <Button
                                            variant="outline"
                                            className="w-full sm:w-auto border-violet-600 text-violet-600 hover:bg-violet-600/5"
                                            onClick={() => setIsEditingMode(true)}
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            {profile?.name ? "Edit Profil" : "Lengkapi Profil"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Personal Info & Security */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Personal Info Form or Edit Form */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="mb-6 border-b pb-4">
                                        <h2 className="text-lg font-semibold">Informasi Pribadi</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Perbarui data diri dan lokasi mengajar Anda.</p>
                                    </div>

                                    {isEditingMode ? (
                                        <ProfileEditForm
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            user={profile || { name: "", email: "", phone_number: "", address: "", bio: "" } as any}
                                            onCancel={() => setIsEditingMode(false)}
                                            onSuccess={() => {
                                                setIsEditingMode(false);
                                                mutateProfile();
                                            }}
                                        />
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                                                    <div className="mt-1 flex items-center">
                                                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        <span>{profile?.name}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground">Email</label>
                                                    <div className="mt-1 flex items-center">
                                                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        <span>{profile?.email}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground">Nomor Telepon</label>
                                                    <div className="mt-1 flex items-center">
                                                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        <span>{profile?.phone_number || "-"}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground">Alamat</label>
                                                    <div className="mt-1 flex items-center">
                                                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        <span>{profile?.address || "-"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {profile?.location && (
                                                <div className="pt-4 border-t">
                                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Lokasi Peta</label>
                                                    <div className="flex items-center text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                                                        <MapPin className="mr-2 h-4 w-4 text-primary" />
                                                        <span>
                                                            {profile.location.name}
                                                            {profile.location.latitude && ` (${profile.location.latitude}, ${profile.location.longitude})`}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-2">Tentang Saya</label>
                                                <p className="text-sm whitespace-pre-wrap">{profile?.bio || "Belum ada bio."}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Security Card */}
                            {!isEditingMode && (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="mb-6 border-b pb-4 flex justify-between items-center">
                                            <div>
                                                <h2 className="text-lg font-semibold">Keamanan Akun</h2>
                                                <p className="text-sm text-muted-foreground mt-1">Ubah password Anda secara berkala untuk keamanan.</p>
                                            </div>
                                            <LockKeyhole className="h-8 w-8 text-violet-600/30" />
                                        </div>
                                        <form className="space-y-4 max-w-lg" onSubmit={handleUpdatePassword}>
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground" htmlFor="current-password">Password Saat Ini</label>
                                                <Input className="mt-1" id="current-password" name="current-password" type="password" required />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="new-password">Password Baru</label>
                                                    <Input className="mt-1" id="new-password" name="new-password" type="password" required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="confirm-password">Konfirmasi Password</label>
                                                    <Input className="mt-1" id="confirm-password" name="confirm-password" type="password" required />
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <Button className="bg-violet-600 hover:bg-violet-700" disabled={isChangingPassword}>
                                                    {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    Update Password
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column: Teaching Stats */}
                        <div className="lg:col-span-1 space-y-8">
                            <Card className="sticky top-24">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-semibold">Informasi Mengajar</h2>
                                        <BookOpen className="h-5 w-5 text-violet-600/50" />
                                    </div>
                                    <div className="space-y-6">
                                        {/* Total Students */}
                                        <div className="flex items-center p-4 bg-muted/50 rounded-lg border transition hover:border-violet-600/30">
                                            <div className="flex-shrink-0 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-muted-foreground">Total Murid</p>
                                                <p className="text-xl font-bold">{studentsCount}</p>
                                            </div>
                                        </div>
                                        {/* Total Sessions */}
                                        <div className="flex items-center p-4 bg-muted/50 rounded-lg border transition hover:border-violet-600/30">
                                            <div className="flex-shrink-0 p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-muted-foreground">Total Sesi</p>
                                                <p className="text-xl font-bold">{profile?.total_sessions || 0}</p>
                                            </div>
                                        </div>
                                        {/* Rating */}
                                        <div className="flex items-center p-4 bg-muted/50 rounded-lg border transition hover:border-violet-600/30">
                                            <div className="flex-shrink-0 p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                                <Star className="h-5 w-5" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-muted-foreground">Rating Tutor</p>
                                                <div className="flex items-center gap-1">
                                                    <p className="text-xl font-bold">{profile?.average_rating?.toFixed(1) || "0.0"}</p>
                                                    <span className="text-xs text-muted-foreground">/ 5.0</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px w-full bg-border my-4" />

                                        {/* Join Date */}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Bergabung Sejak</span>
                                            <span className="font-medium">
                                                {profile?.joined_at
                                                    ? new Date(profile.joined_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : "Baru"}
                                            </span>
                                        </div>

                                        {/* CTA */}
                                        <Button variant="outline" className="w-full mt-4">
                                            Lihat Profil Publik
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
