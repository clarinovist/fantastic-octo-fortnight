import { LoginForm } from "@/components/brand/auth/login-form"
import Image from "next/image"

export default async function LoginPage() {
  return (
    <div className="h-screen bg-[#6372FF]">
      <Image
        src="/bg-illust.png"
        alt="Background Illustration"
        width={0}
        height={0}
        className="w-full absolute top-0 left-0 object-cover rotate-180"
      />
      <div className="max-w-[1000px] mx-auto h-full flex items-center z-10 relative">
        <LoginForm />
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
