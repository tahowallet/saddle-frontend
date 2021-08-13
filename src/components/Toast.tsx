import "./Toast.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"

type ToastType = "error" | "success" | "pending"
function getIconForType(type: ToastType): string {
  switch (type) {
    case "error":
      return "iconCancelCircle"
    case "success":
      return "iconCheckCircle"
    case "pending":
      return "iconWaitingCircle"
  }
}
export interface ToastProps {
  type: ToastType
  title: string
  onClick: () => void
}
export default function Toast({
  title,
  type,
  onClick,
}: ToastProps): ReactElement {
  return (
    <div className={classNames("toast", `toast-${type}`)} onClick={onClick}>
      <div className="title">
        <span className={getIconForType(type)}></span>
        <span>{title}</span>
      </div>
    </div>
  )
}
