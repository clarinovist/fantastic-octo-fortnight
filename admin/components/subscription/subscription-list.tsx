"use client";

import { updateSubscriptionPricesAction } from "@/actions/subscription";
import type { Column, RowAction } from "@/components/base/table/data-table";
import {
  DataTable,
  type DataTableRef,
} from "@/components/base/table/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SubscriptionItem } from "@/utils/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { SubscriptionForm, type SubscriptionSubmitPayload } from "./subscription-form";

type SubscriptionListProps = {
  subscriptions: SubscriptionItem[];
  totalData: number;
  currentPage?: number;
  pageSize?: number;
};

export function SubscriptionList({
  subscriptions,
  totalData,
  currentPage = 1,
  pageSize = 10,
}: SubscriptionListProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataTableRef = useRef<DataTableRef>(null);
  const [isPending, startTransition] = useTransition();
  const [editingSubscription, setEditingSubscription] =
    useState<SubscriptionItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const columns: Column<SubscriptionItem>[] = [
    {
      key: "name",
      label: "Name",
      width: "300px",
      type: "string",
    },
    {
      key: "interval",
      label: "Interval",
      width: "200px",
      type: "string",
    },
    {
      key: "price",
      label: "Price",
      width: "200px",
      type: "currency",
    },
  ];

  const handleEdit = (subscription: SubscriptionItem) => {
    setEditingSubscription(subscription);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSubscription(null);
  };

  const rowActions: RowAction<SubscriptionItem>[] = [
    {
      label: "Edit",
      variant: "outline",
      onClick: (row) => handleEdit(row),
    },
  ];

  const handlePageChange = (page: number): void => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`?${params.toString()}`);
    });
  };

  const handlePageSizeChange = (newPageSize: number): void => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", newPageSize.toString());
      params.set("page", "1");
      router.push(`${window.location.pathname}?${params.toString()}`);
    });
  };

  const handleFormSubmit = async (subscriptionId: string, payload: SubscriptionSubmitPayload) => {
    const result = await updateSubscriptionPricesAction(
      subscriptionId,
      payload
    );

    if (result.success) {
      handleCloseDialog();
    }

    return result;
  };

  // Parse price string to extract numeric value (remove "Rp" and formatting)
  const parsePrice = (priceString: string): string => {
    return priceString.replace(/[^\d]/g, "");
  };

  return (
    <>
      <DataTable<SubscriptionItem>
        ref={dataTableRef}
        data={subscriptions}
        columns={columns}
        rowActions={rowActions}
        showSearch={false}
        showCheckboxes={false}
        showToolbar={false}
        emptyMessage="No subscriptions found"
        serverSidePagination={true}
        currentPage={currentPage}
        totalItems={totalData}
        rowsPerPage={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        isLoading={isPending}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          {editingSubscription && (
            <SubscriptionForm
              subscriptionId={editingSubscription.id}
              initialData={{
                name: editingSubscription.name,
                interval: editingSubscription.interval,
                price: parsePrice(editingSubscription.price),
              }}
              action={handleFormSubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
