import React, { ReactElement } from "react"
import useCopyClipboard from "../hooks/useCopyClipboard"

export default function CopyHelper(props: {
  toCopy: string
  children?: React.ReactNode
}): ReactElement {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <button className="textStyle" onClick={() => setCopied(props.toCopy)}>
      {isCopied ? (
        <>
          {/* Shows check icon after copied */}
          <span className="iconCheck buttonGroupIcon"></span>
          <span className="textStyle">Copied!</span>
        </>
      ) : (
        // Shows copy icon when isCopied = false
        <span className="iconCopy"></span>
      )}
      {isCopied ? "" : props.children}
    </button>
  )
}
