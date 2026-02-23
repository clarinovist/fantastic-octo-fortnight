import { AccountContainer } from "@/components/brand/account/account-container"
import { getMe } from "@/services/account"

export default async function AccountPage() {
  const me = await getMe()
  if (!me.data) {
    return null
  }
  const apiKey = process.env.NEXT_GOOGLE_KEY || ""
  return <AccountContainer apiKey={apiKey} detail={me.data} />
}
