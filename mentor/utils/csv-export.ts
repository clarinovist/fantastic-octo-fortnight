export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    columns: { key: keyof T; label: string }[]
) {
    if (!data || data.length === 0) {
        throw new Error("Tidak ada data untuk diekspor");
    }

    // Create CSV header
    const header = columns.map((col) => col.label).join(",");

    // Create CSV rows
    const rows = data.map((item) =>
        columns
            .map((col) => {
                const value = item[col.key];
                // Handle null/undefined
                if (value === null || value === undefined) {
                    return '""';
                }
                // Escape commas and quotes
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            })
            .join(",")
    );

    // Combine header and rows
    const csv = [header, ...rows].join("\n");

    // Add BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csv;

    // Create download link
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function formatDateForFilename(date: Date = new Date()): string {
    return date.toISOString().split("T")[0];
}
