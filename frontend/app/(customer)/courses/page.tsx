import { CoursesFilter } from "@/components/brand/course-filter"
import { CourseList } from "@/components/brand/course-list"
import { LayoutCustomer } from "@/components/brand/layout-customer"
import { SearchCourse } from "@/components/brand/search-course"

interface CoursePageProps {
  searchParams: {
    courseCategoryId?: string
    courseCategoryName?: string
    locationId?: string
    locationName?: string
    maxResponseTime?: string
    maxPrice?: string
    latitude?: string
    longitude?: string
    freeFirstCourse?: string
    classType?: string[]
    levelEducationCourse?: string[]
    rating?: string[]
    radius?: string
  }
}

export default async function CoursePage({ searchParams }: CoursePageProps) {
  const {
    courseCategoryId,
    courseCategoryName,
    locationId,
    locationName,
    maxResponseTime,
    maxPrice,
    latitude,
    longitude,
    freeFirstCourse,
    classType,
    levelEducationCourse,
    rating,
    radius,
  } = await searchParams

  const getPageTitle = () => {
    if (courseCategoryName) {
      return courseCategoryName
    }
  }

  const getSubtitle = () => {
    if (locationName) {
      return locationName
    }
  }

  const header = <SearchCourse />

  const subheader = (
    <div className="flex p-8 pb-4 overflow-auto md:overflow-visible scrollbar-hide">
      {getPageTitle() || getSubtitle() ? (
        <div className="flex-shrink-0 lg:block hidden">
          {getPageTitle() && (
            <h1 className="text-3xl font-bold text-gray-900 order-0 lg:order-1">
              {getPageTitle()}
            </h1>
          )}
          {getSubtitle() && (
            <div className="flex items-center gap-2 mt-2">
              <svg
                className="size-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 12 13"
                fill="none"
              >
                <path
                  d="M1.75714 1.65946C4.10004 -0.553154 7.89898 -0.553154 10.2426 1.65946C12.5862 3.87208 12.5855 7.45742 10.2426 9.67003L9.42462 10.4332C8.64503 11.1543 7.86268 11.8727 7.07759 12.5885C6.78846 12.8525 6.40202 13 5.99985 13C5.59768 13 5.21124 12.8525 4.92212 12.5885L2.51651 10.3785C2.21423 10.0983 1.96111 9.86195 1.75714 9.66938C0.632055 8.60708 0 7.16635 0 5.6641C0 4.16185 0.632055 2.72111 1.75714 1.65881M5.99985 3.89095C5.72837 3.89095 5.45956 3.94143 5.20874 4.03951C4.95793 4.1376 4.73004 4.28136 4.53807 4.4626C4.34611 4.64383 4.19384 4.85899 4.08995 5.09579C3.98606 5.33258 3.93259 5.58638 3.93259 5.84268C3.93259 6.09899 3.98606 6.35278 4.08995 6.58958C4.19384 6.82637 4.34611 7.04153 4.53807 7.22277C4.73004 7.404 4.95793 7.54777 5.20874 7.64585C5.45956 7.74393 5.72837 7.79442 5.99985 7.79442C6.54812 7.79442 7.07394 7.58879 7.46163 7.22277C7.84932 6.85675 8.06712 6.36031 8.06712 5.84268C8.06712 5.32505 7.84932 4.82862 7.46163 4.4626C7.07394 4.09658 6.54812 3.89095 5.99985 3.89095Z"
                  fill="#7000FE"
                />
              </svg>
              <p className="text-[#848484] font-bold">{getSubtitle()}</p>
            </div>
          )}
        </div>
      ) : null}
      <CoursesFilter />
    </div>
  )

  return (
    <LayoutCustomer
      isShowSidebar
      isShowNotification
      header={header}
      subheader={subheader}
      wrapperHeaderChildrenClassName="h-screen"
    >
      {getPageTitle() || getSubtitle() ? (
        <div className="sticky top-[-1] bg-white z-3 mb-4 lg:hidden block">
          {getPageTitle() && (
            <h1 className="text-3xl font-bold text-gray-900 order-0 lg:order-1">
              {getPageTitle()}
            </h1>
          )}
          {getSubtitle() && (
            <div className="flex items-center gap-2 mt-2">
              <svg
                className="size-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 12 13"
                fill="none"
              >
                <path
                  d="M1.75714 1.65946C4.10004 -0.553154 7.89898 -0.553154 10.2426 1.65946C12.5862 3.87208 12.5855 7.45742 10.2426 9.67003L9.42462 10.4332C8.64503 11.1543 7.86268 11.8727 7.07759 12.5885C6.78846 12.8525 6.40202 13 5.99985 13C5.59768 13 5.21124 12.8525 4.92212 12.5885L2.51651 10.3785C2.21423 10.0983 1.96111 9.86195 1.75714 9.66938C0.632055 8.60708 0 7.16635 0 5.6641C0 4.16185 0.632055 2.72111 1.75714 1.65881M5.99985 3.89095C5.72837 3.89095 5.45956 3.94143 5.20874 4.03951C4.95793 4.1376 4.73004 4.28136 4.53807 4.4626C4.34611 4.64383 4.19384 4.85899 4.08995 5.09579C3.98606 5.33258 3.93259 5.58638 3.93259 5.84268C3.93259 6.09899 3.98606 6.35278 4.08995 6.58958C4.19384 6.82637 4.34611 7.04153 4.53807 7.22277C4.73004 7.404 4.95793 7.54777 5.20874 7.64585C5.45956 7.74393 5.72837 7.79442 5.99985 7.79442C6.54812 7.79442 7.07394 7.58879 7.46163 7.22277C7.84932 6.85675 8.06712 6.36031 8.06712 5.84268C8.06712 5.32505 7.84932 4.82862 7.46163 4.4626C7.07394 4.09658 6.54812 3.89095 5.99985 3.89095Z"
                  fill="#7000FE"
                />
              </svg>
              <p className="text-[#848484] font-bold">{getSubtitle()}</p>
            </div>
          )}
        </div>
      ) : null}
      <div className="overflow-y-auto lg:px-8 p-4 pt-0 scrollbar-hide">
        {/* Scrollable Course List */}
        <CourseList
          filters={{
            courseCategoryId,
            locationId,
            maxResponseTime,
            maxPrice,
            latitude,
            longitude,
            freeFirstCourse,
            classType,
            levelEducationCourse,
            rating,
            radius,
          }}
        />
      </div>
    </LayoutCustomer>
  )
}
