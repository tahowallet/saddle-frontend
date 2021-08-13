import "../styles/Text.scss"

import React, { ReactElement } from "react"

import classNames from "classnames"

interface Props {
  children: React.ReactNode
  type?: "h1" | "h2" | "p" | "span" | "div"
  size?: "100" | "30" | "24" | "20" | "16" | "12" | "10" | "default"
  font?: "serif" | "sans" | "default"
  color?: "primary" | "secondary" | "alert" | "warning" | "default"
  bold?: true | false
  caps?: true | false
}

export default function Text(
  props: React.PropsWithChildren<Props>,
): ReactElement {
  const {
    type = "div",
    size = "default",
    font = "default",
    color = "default",
    bold = false,
    caps = false,
  } = props

  const TagName = type
  const boldClass = bold ? "bold" : ""
  const capsClass = caps ? "caps" : ""
  const sizeClass = size == "default" ? "default" : "s" + size

  return (
    <TagName
      className={classNames(
        "text",
        color,
        font,
        sizeClass,
        boldClass,
        capsClass,
      )}
    >
      {props.children}
    </TagName>
  )
}
