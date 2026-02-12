"use client"

import { AccountInfoForm } from "@/components/brand/account/account-info-form"
import { AccountInfoView } from "@/components/brand/account/account-info-view"
import { MeResponse } from "@/utils/types"
import { useState } from "react"

type AccountInfoProps = {
  detail: MeResponse
  className?: string
}

export function AccountInfo(props: AccountInfoProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className={props.className}>
      {isEditing ? (
        <AccountInfoForm detail={props.detail} onSuccess={() => setIsEditing(false)} />
      ) : (
        <AccountInfoView detail={props.detail} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  )
}
