import { RoleSection } from "@/components/brand/auth/role-selection"
import { SignupForm } from "@/components/brand/auth/signup-form"
import Image from "next/image"

interface SignupFormProps {
  searchParams: {
    isRoleSection?: boolean
  }
}

export default async function SignupPage({ searchParams }: SignupFormProps) {
  const { isRoleSection } = await searchParams
  return (
    <div className="relative h-screen bg-[#6372FF]">
      <Image
        src="/bg-illust.png"
        alt="Background Illustration"
        width={0}
        height={0}
        className="w-full absolute top-0 left-0 object-cover rotate-180"
      />
      <div className="max-w-[1000px] mx-auto h-full flex items-center z-10 relative">
        {isRoleSection ? <RoleSection /> : <SignupForm />}
      </div>
      <Image
        src="/bg-illust.png"
        alt="Background Illustration"
        width={0}
        height={0}
        className="w-full absolute bottom-0 left-0 object-cover"
      />
    </div>
  )
}
