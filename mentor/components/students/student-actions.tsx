"use client";

import { useState } from "react";
import { MoreVertical, Eye, MessageSquare, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StudentActionsProps {
    studentId: string;
    studentName: string;
}

export function StudentActions({ studentId, studentName }: StudentActionsProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleViewDetails = () => {
        router.push(`/students/${studentId}`);
        setIsOpen(false);
    };

    const handleSendMessage = () => {
        router.push(`/messages?student=${studentId}`);
        setIsOpen(false);
    };

    const handleArchive = () => {
        toast.info("Fitur arsip murid akan segera hadir");
        setIsOpen(false);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Aksi untuk {studentName}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleViewDetails}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendMessage}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Kirim Pesan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleArchive} className="text-red-600 focus:text-red-600">
                    <Archive className="mr-2 h-4 w-4" />
                    Arsipkan
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
