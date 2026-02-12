"use client";

import { sendNotificationsAction } from "@/actions/notification";
import { BaseForm, InputField, TextareaField } from "@/components/base/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Tutor } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const messageSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
  link: z.string().optional(),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface TutorMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: Tutor[];
  onMessageSent?: () => void;
}

export function TutorMessageDialog({
  open,
  onOpenChange,
  recipients,
  onMessageSent,
}: TutorMessageDialogProps) {
  const [activeTab, setActiveTab] = useState<"email" | "notification">("email");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      subject: "",
      body: "",
      link: "",
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSend = async (data: MessageFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        title: data.subject,
        message: data.body,
        link: data.link || undefined,
        type: activeTab,
        userIds: recipients.map((r) => r.userId),
      };
      const result = await sendNotificationsAction(payload);
      if (result.success) {
        toast.success(
          `${activeTab} sent to ${recipients.length} user${
            recipients.length === 1 ? "" : "s"
          }`
        );
        form.reset();
        onOpenChange(false);
        onMessageSent?.();
      } else {
        toast.error(result.error || `Failed to send ${activeTab}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-card rounded-lg">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="text-2xl font-semibold">
              Send Message
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("email")}
                className={`py-4 text-lg font-medium relative ${
                  activeTab === "email"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                email
                {activeTab === "email" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("notification")}
                className={`py-4 text-lg font-medium relative ${
                  activeTab === "notification"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                notification
                {activeTab === "notification" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Form */}
          <BaseForm form={form} onSubmit={handleSend}>
            <div className="p-6 space-y-6">
              {/* Subject */}
              <InputField
                name="subject"
                label="subject"
                placeholder="Enter subject line"
                required
              />

              {/* Send To */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-foreground block">
                  send to
                </label>
                <div className="w-full bg-muted rounded-sm p-4">
                  <div className="text-foreground font-medium">
                    {recipients.length}{" "}
                    {recipients.length === 1 ? "user" : "users"}
                  </div>
                  {recipients.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {recipients.slice(0, 3).map((tutor) => (
                        <div key={tutor.id}>
                          {tutor.name} ({tutor.email})
                        </div>
                      ))}
                      {recipients.length > 3 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="mt-1 cursor-help">
                                and {recipients.length - 3} more...
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {recipients.slice(3).map((tutor) => (
                                  <div key={tutor.id}>
                                    {tutor.name} ({tutor.email})
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <TextareaField
                name="body"
                label="body"
                placeholder="Enter message body..."
                required
                rows={10}
              />

              {/* Link */}
              <InputField
                name="link"
                label="link"
                placeholder="Enter link (optional)"
              />

              {/* Send Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="px-8 py-6 text-lg font-medium"
                >
                  cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || recipients.length === 0}
                  className="px-12 py-6 text-lg font-medium rounded-sm"
                >
                  {isLoading ? "sending..." : "send"}
                </Button>
              </div>
            </div>
          </BaseForm>
        </div>
      </DialogContent>
    </Dialog>
  );
}
