import { AuthError } from "@/components/brand/auth/error"

type AuthErrorPageProps = {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams
  const error = params.error
  const message = params.message

  return <AuthError error={error} message={message} />
}
