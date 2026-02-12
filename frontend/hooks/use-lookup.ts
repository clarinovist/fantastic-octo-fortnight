import useSWR from "swr"
import { clientFetch } from "../services/client"
import { Lookup } from "../utils/types"

export const useLookup = (lookupType: string) => {
  const { data, error, isLoading } = useSWR<Lookup[]>(
    `/api/v1/lookups?type=${lookupType}`,
    clientFetch<Lookup[]>
  )

  return {
    data: data || [],
    isLoading,
    error
  }
}