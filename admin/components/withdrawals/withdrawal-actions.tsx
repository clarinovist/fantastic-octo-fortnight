"use client";

import { useState } from "react";
import { approveWithdrawal, rejectWithdrawal } from "@/services/finance";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface WithdrawalActionsProps {
    id: string;
    status: string;
}

export function WithdrawalActions({ id, status }: WithdrawalActionsProps) {
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    if (status.toLowerCase() !== "pending") return null;

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            const res = await approveWithdrawal(id);
            if (res.success) {
                toast.success("Withdrawal approved successfully");
                router.refresh();
            } else {
                toast.error(res.message || "Failed to approve withdrawal");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectNote) {
            toast.error("Please provide a rejection reason");
            return;
        }
        setIsLoading(true);
        try {
            const res = await rejectWithdrawal(id, rejectNote);
            if (res.success) {
                toast.success("Withdrawal rejected successfully");
                setIsRejectOpen(false);
                router.refresh();
            } else {
                toast.error(res.message || "Failed to reject withdrawal");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2 justify-end">
            <Button
                size="sm"
                variant="outline"
                className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                onClick={handleApprove}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <>
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Approve
                    </>
                )}
            </Button>

            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <>
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                Reject
                            </>
                        )}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Withdrawal Request</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject this withdrawal request? This action cannot be undone.
                            Please provide a reason for the rejection.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for rejection (e.g. Invalid bank details)..."
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isLoading || !rejectNote}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
