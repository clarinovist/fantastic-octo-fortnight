import { AuthCallback } from "@/components/brand/auth/callback"

type AuthCallbackPageProps = {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams
  const state = params.state

  return <AuthCallback state={state} />
}
