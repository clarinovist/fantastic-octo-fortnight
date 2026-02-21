"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { MultipleSelect } from "@/components/ui/multiple-select"
import { UseFormReturn } from "react-hook-form"
import { CourseWizardData } from "../schema"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { useWizard } from "../wizard-container"

interface StepProps {
    form: UseFormReturn<CourseWizardData>
}

const GRADES = [
    ["TK", "SD", "SMP", "SMA"],
    ["MI", "MTs", "MTA"],
    ["SMK"]
]

export function StepAudiens({ form }: StepProps) {
    const { detail } = useWizard()
    const [searchCategory, setSearchCategory] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null)
    const [subCategoryOptions, setSubCategoryOptions] = useState<{ id: string; label: string }[]>([])
    const [subCategoryKey, setSubCategoryKey] = useState(0)

    // Initialize from existing course data in edit mode
    useEffect(() => {
        if (detail?.courseCategory) {
            setSearchCategory(detail.courseCategory.name)
            setSelectedCategory({ id: detail.courseCategory.id, name: detail.courseCategory.name })

            // Pre-fetch sub-categories for the existing category
            fetch(`/api/v1/course-categories/${detail.courseCategory.id}/sub?page=1`)
                .then(res => res.json())
                .then(({ data }) => {
                    const options = data?.map((item: { id: string; name: string }) => ({ id: item.id, label: item.name })) || []
                    setSubCategoryOptions(options)
                    setSubCategoryKey(prev => prev + 1)

                    // Populate subCategoryNames from fetched options matching existing IDs
                    const currentSubIDs = form.getValues("subCategoryIDs") || []
                    if (currentSubIDs.length > 0) {
                        const names = currentSubIDs
                            .map((id: string) => options.find((o: { id: string; label: string }) => o.id === id)?.label)
                            .filter(Boolean) as string[]
                        if (names.length > 0) {
                            form.setValue("subCategoryNames", names)
                        }
                    }
                })
                .catch(() => { /* ignore */ })
        }
    }, [detail])

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-bold mb-2">Tingkat dan Subjek</h2>
                <p className="text-muted-foreground">Pilih target murid dan mata pelajaran yang akan diajarkan.</p>
            </div>

            <FormField
                control={form.control}
                name="levelEducationCourses"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <FormLabel className="text-base font-semibold">Pilih tingkat</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {GRADES.map((column, colIdx) => (
                                <div key={colIdx} className="space-y-3">
                                    {column.map((grade) => (
                                        <div key={grade} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`grade-${grade}`}
                                                checked={field.value?.includes(grade)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        field.onChange([...(field.value || []), grade])
                                                    } else {
                                                        field.onChange(field.value?.filter((g: string) => g !== grade))
                                                    }
                                                }}
                                                className="w-5 h-5"
                                            />
                                            <Label htmlFor={`grade-${grade}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {grade}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="courseCategoryID"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <FormLabel className="text-base font-semibold">Pilih subjek</FormLabel>
                        <FormControl>
                            <div className="border rounded-lg bg-background px-3 py-1 flex items-center group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                <Search className="w-4 h-4 text-muted-foreground mr-2" />
                                <SearchableSelect<{ id: string; name: string }>
                                    placeholder="Cari mata pelajaran..."
                                    value={searchCategory}
                                    onChange={setSearchCategory}
                                    apiEndpoint="/api/v1/course-categories"
                                    getDisplayText={(item) => item.name}
                                    onSelect={(category) => {
                                        setSelectedCategory(category)
                                        field.onChange(category.id)
                                        form.setValue("courseCategoryName", category.name)
                                        form.setValue("subCategoryIDs", [])
                                        form.setValue("subCategoryNames", [])
                                        setSubCategoryKey(prev => prev + 1)
                                        setSubCategoryOptions([])
                                    }}
                                    className="flex-1"
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="subCategoryIDs"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <FormLabel className="text-base font-semibold">Pilih sub-subjek</FormLabel>
                        <div className="border rounded-xl p-6 bg-muted/30">
                            <MultipleSelect
                                key={subCategoryKey}
                                options={[...new Map(subCategoryOptions.map(o => [o.id, o])).values()]}
                                value={field.value || []}
                                onLoadMore={async (page) => {
                                    if (!selectedCategory) return []
                                    try {
                                        const res = await fetch(`/api/v1/course-categories/${selectedCategory.id}/sub?page=${page}`)
                                        const { data } = await res.json()
                                        const newOptions = data?.map((item: { id: string; name: string }) => ({ id: item.id, label: item.name })) || []
                                        setSubCategoryOptions(prev => {
                                            const existingIds = new Set(prev.map(o => o.id))
                                            const uniqueNew = newOptions.filter((o: { id: string }) => !existingIds.has(o.id))
                                            return [...prev, ...uniqueNew]
                                        })
                                        return newOptions
                                    } catch {
                                        return []
                                    }
                                }}
                                onSelectionChange={(ids) => {
                                    field.onChange(ids)
                                    const selectedLabels = ids
                                        .map(id => subCategoryOptions.find(opt => opt.id === id)?.label)
                                        .filter(Boolean) as string[];
                                    form.setValue("subCategoryNames", selectedLabels)
                                }}
                            />
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
