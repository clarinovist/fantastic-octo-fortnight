import { AccountContainer } from "@/components/brand/account/account-container"
import { getMe, getTutorDocuments } from "@/services/account"

export default async function AccountPage() {
  const me = await getMe()
  if (!me.data) {
    return null
  }
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  const documents = me.data.role === "tutor" ? await getTutorDocuments() : { data: [] }
  return <AccountContainer apiKey={apiKey} detail={me.data} documents={documents.data} />
}
