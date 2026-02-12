"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { LocationSelector } from "./location-selector"
import { updateProfileAction, updateLocationAction } from "@/actions/profile"
import { User } from "@/utils/types"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

const profileSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    phoneNumber: z.string().min(10, "Nomor telepon tidak valid"),
    address: z.string().optional(),
    bio: z.string().optional(),
})

interface ProfileEditFormProps {
    user: User
    onCancel: () => void
    onSuccess: () => void
}

export function ProfileEditForm({ user, onCancel, onSuccess }: ProfileEditFormProps) {
    const [isPending, startTransition] = useTransition()

    // Default location to Jakarta if not set
    const defaultLat = user.location?.latitude || -6.175392
    const defaultLng = user.location?.longitude || 106.827153
    const [location, setLocation] = useState({
        lat: defaultLat,
        lng: defaultLng,
        address: user.location?.name || ""
    })

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || "",
            phoneNumber: user.phone_number || "",
            address: user.address || "",
            // User type in utils/types/index.ts usually has bio/description field? 
            // Checking Step 1022 type definition... it doesn't seem to have bio explicitly, 
            // but the plan mentioned bio. We'll leave it optional/empty if not present.
            bio: user.bio || "",
        },
    })

    const onSubmit = (values: z.infer<typeof profileSchema>) => {
        startTransition(async () => {
            // Update Text Profile
            const profileRes = await updateProfileAction({
                name: values.name,
                phoneNumber: values.phoneNumber,
                address: values.address,
                bio: values.bio
            })

            // Update Location
            // We only update location if it changed or if we explicitly want to save it
            // Ideally backend handles this in one go, but we have separate actions per plan/service
            const locationRes = await updateLocationAction(
                location.lat,
                location.lng,
                location.address || values.address || "" // Fallback to form address if location address not set
            )

            if (profileRes.success && locationRes.success) {
                toast.success("Profil berhasil diperbarui")
                onSuccess()
            } else {
                toast.error("Gagal memperbarui profil")
                console.error(profileRes.error, locationRes.error)
            }
        })
    }

    const handleLocationSelect = (lat: number, lng: number, address: string) => {
        setLocation({ lat, lng, address })
        // Optional: populate address field with map address
        if (address) {
            form.setValue("address", address)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Lengkap</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nama Anda" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nomor Telepon</FormLabel>
                                <FormControl>
                                    <Input placeholder="08..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tentang Saya (Bio)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ceritakan sedikit tentang pengalaman mengajar Anda..."
                                    className="resize-none min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <FormLabel>Lokasi Mengajar</FormLabel>
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    {/* Hidden input to bind address for validation but show map picker mainly */}
                                    {/* Actually we show the input too */}
                                    <Input placeholder="Alamat lengkap" {...field} className="mb-2" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="border rounded-lg p-1 bg-muted/20">
                        <LocationSelector
                            initialLat={location.lat}
                            initialLng={location.lng}
                            initialAddress={location.address}
                            onLocationSelect={handleLocationSelect}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Perubahan
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
