import { CategoryBadge } from "@/components/brand/category-badge"
import { LayoutCustomer } from "@/components/brand/layout-customer"
import { Logo } from "@/components/brand/logo"
import { SearchCourse } from "@/components/brand/search-course"
import { getCoursesCategoriesTrending } from "@/services/course"

export default async function HomePage() {
  const { data } = await getCoursesCategoriesTrending()
  return (
    <LayoutCustomer hideLogo isShowSidebar>
      <div className="flex flex-col items-center justify-center h-full">
        {/* Logo */}
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <Logo size="large" />
          </div>
        </div>

        <SearchCourse className="mb-8" />

        {/* Category Badges */}
        {data && data.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {data.map(category => (
              <CategoryBadge key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </LayoutCustomer>
  )
}
