import { AccountContainer } from "@/components/brand/account/account-container"
<<<<<<< HEAD
import { getMe, getTutorDocuments } from "@/services/account"
=======
import { getMe } from "@/services/account"
>>>>>>> 1a19ced (chore: update service folders from local)

export default async function AccountPage() {
  const me = await getMe()
  if (!me.data) {
    return null
  }
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
<<<<<<< HEAD
  const documents = me.data.role === "tutor" ? await getTutorDocuments() : { data: [] }
  return <AccountContainer apiKey={apiKey} detail={me.data} documents={documents.data} />
=======
  return <AccountContainer apiKey={apiKey} detail={me.data} />
>>>>>>> 1a19ced (chore: update service folders from local)
}
