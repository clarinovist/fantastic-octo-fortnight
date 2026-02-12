import { Button } from "@/components/ui/button"
import type { CourseCategory } from "@/utils/types"
import Link from "next/link"

export function CategoryBadge({ category }: { category: CourseCategory }) {
  return (
    <Link href={`/courses?courseCategoryId=${category.id}&courseCategoryName=${category.name}`}>
      <Button className="hover:bg-[#7000FE] cursor-pointer bg-[#D9D9D9] text-[#9C9C9C] hover:text-white rounded-full px-6">
        {category.name}
      </Button>
    </Link>
  )
}
