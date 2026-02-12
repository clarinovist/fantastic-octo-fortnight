import { LayoutCustomer } from "@/components/brand/layout-customer"
import { Plans } from "@/components/brand/plans/plans"
import { getPlans } from "@/services/subscription"

export default async function PlansPage() {
  const plans = await getPlans()

  return (
    <LayoutCustomer
      isShowSidebar
      isShowBackButton
      className="bg-[linear-gradient(292.71deg,#E7D8FE_0%,#8100E3_98.64%)]"
      headerClassName="!bg-transparent"
      logoTypeOnMediumDevice="full-white"
      logoTypeOnSmallDevice="full-white"
      humbergerMenuClassName="text-white"
      backButtonColorMedium="blue"
      backButtonColorSmall="white"
      sidebarType="main"
    >
      <Plans plans={plans?.data ?? []} />
    </LayoutCustomer>
  )
}
