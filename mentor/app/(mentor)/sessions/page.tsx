"use client";

import { useState } from "react";
import useSWR from "swr";
import {
    Plus,
    CalendarCheck,
    CalendarRange,
    Clock,
    Search,
    Filter,
    Edit,
    Eye,
    MapPin,
    FileText,
    Calendar,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getMentorSessions } from "@/services/mentor";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateSessionDialog } from "@/components/sessions/create-session-dialog";
import { SessionDetailDialog } from "@/components/sessions/session-detail-dialog";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "@/contexts/google-maps";

export default function SessionsPage() {
    const [page, setPage] = useState(1);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const { data, isLoading, mutate } = useSWR(["/mentor/sessions", page], () => getMentorSessions(page));
    const { isLoaded } = useGoogleMaps();

    // Calculate stats from API response metadata
    const stats = [
        {
            title: "Total Sesi",
            value: data?.metadata?.total_items || 0,
            icon: CalendarCheck,
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            title: "Sesi Bulan Ini",
            value: data?.data?.filter(s => {
                const date = new Date(s.booking_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length || 0,
            icon: CalendarRange,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Menunggu Konfirmasi",
            value: data?.data?.filter(s => s.status === 'pending').length || 0,
            icon: Clock,
            color: "text-amber-600",
            bgColor: "bg-amber-100",
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "accepted":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Terjadwal</Badge>;
            case "completed":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Selesai</Badge>;
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Menunggu</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Dibatalkan</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Find next offline session with location
    const nextOfflineSession = data?.data?.find(s =>
        s.class_type === 'offline' &&
        s.status === 'accepted' &&
        new Date(s.booking_date) >= new Date(new Date().setHours(0, 0, 0, 0)) &&
        s.latitude && s.longitude
    );

    const mapCenter = nextOfflineSession && nextOfflineSession.latitude && nextOfflineSession.longitude ? {
        lat: Number(nextOfflineSession.latitude),
        lng: Number(nextOfflineSession.longitude)
    } : { lat: -6.2088, lng: 106.8456 }; // Default to Jakarta

    return (
        <div className="flex flex-col flex-1">
            <CreateSessionDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={() => mutate()}
            />

            {/* Header Section */}
            <PageHeader
                breadcrumbs={[{ label: "Sesi Mengajar" }]}
                actions={
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Sesi Baru
                    </Button>
                }
            />

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${stat.bgColor} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">{stat.title}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters and Table Container */}
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    {/* Filter Bar */}
                    <div className="p-6 border-b flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-10 bg-muted/50 border-none focus-visible:ring-primary/20"
                                placeholder="Cari nama siswa atau mata pelajaran..."
                            />
                        </div>
                        <Select>
                            <SelectTrigger className="w-[180px] bg-muted/50 border-none focus:ring-primary/20">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="accepted">Terjadwal</SelectItem>
                                <SelectItem value="completed">Selesai</SelectItem>
                                <SelectItem value="pending">Menunggu</SelectItem>
                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-md py-2 px-4 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Filter Tanggal</span>
                        </div>
                        <Button variant="ghost" size="icon" className="hover:bg-muted">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>

                    {/* Table */}
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[250px] font-bold uppercase text-xs tracking-wider">Siswa</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider">Mata Pelajaran</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider">Jadwal</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider">Durasi</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider">Status</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider">Lokasi</TableHead>
                                <TableHead className="text-right font-bold uppercase text-xs tracking-wider">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20 mt-1" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><div className="flex justify-end gap-2"><Skeleton className="h-8 w-8" /></div></TableCell>
                                    </TableRow>
                                ))
                            ) : data?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        Belum ada sesi mengajar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data?.map((session) => (
                                    <TableRow key={session.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {session.student_name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-sm">{session.student_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-medium">
                                                {session.course_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{session.booking_date}</span>
                                                <span className="text-xs text-muted-foreground">{session.booking_time}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            60 Menit
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(session.status)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {session.class_type === 'online' ? 'Online (Zoom)' : 'Offline'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setSelectedSessionId(session.id); setDetailDialogOpen(true); }}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="p-6 border-t flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {data?.data?.length || 0} dari {data?.metadata?.total_items || 0} sesi
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="default" // Active page style
                                size="sm"
                            >
                                {page}
                            </Button>
                            {/* More page buttons could be added */}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!data?.metadata || page >= Math.ceil((data.metadata.total_items || 0) / (data.metadata.pageSize || 10))}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Real Map Section for Upcoming Session */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Lokasi Sesi Mendatang</h3>
                        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            {!isLoaded ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Memuat Peta...</span>
                                </div>
                            ) : !nextOfflineSession ? (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-8 w-8 opacity-50" />
                                    <span>Tidak ada sesi offline mendatang dengan lokasi.</span>
                                </div>
                            ) : (
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                    center={mapCenter}
                                    zoom={15}
                                    options={{
                                        disableDefaultUI: true,
                                        zoomControl: true,
                                    }}
                                >
                                    <Marker position={mapCenter} />
                                </GoogleMap>
                            )}

                            {/* Overlay info */}
                            {nextOfflineSession && (
                                <div className="absolute bottom-4 left-4 right-4 bg-background/90 p-3 rounded-lg backdrop-blur-sm text-xs border shadow-sm z-10">
                                    <p className="font-bold">Sesi Terdekat: {nextOfflineSession.student_name}</p>
                                    <p className="text-muted-foreground truncate">{nextOfflineSession.course_name} • {nextOfflineSession.booking_date} {nextOfflineSession.booking_time}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Catatan Sesi Terakhir</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-3 rounded-lg bg-muted/50">
                                <FileText className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold">Tautan Zoom / Materi</p>
                                    <p className="text-xs text-muted-foreground italic">&quot;Belum ada catatan baru.&quot;</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-3 rounded-lg border border-dashed justify-center items-center h-20 hover:bg-muted/50 cursor-pointer transition-colors">
                                <button className="text-primary text-sm font-semibold hover:underline">+ Tambah Catatan Baru</button>
                            </div>
                        </div>
                    </div>
                </div>
                <SessionDetailDialog
                    sessionId={selectedSessionId}
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    onStatusChanged={() => mutate()}
                />
            </div>
        </div>
    );
}
