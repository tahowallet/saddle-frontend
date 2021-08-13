import "./CheckboxInput.scss"

import React, { ReactElement } from "react"

interface Props {
  checked: boolean
  onChange: () => void
}

export default function CheckboxInput({
  checked,
  onChange,
}: Props): ReactElement {
  return (
    <label className="checkboxInput">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="checkboxControl">
        <span className="iconCheckbox"></span>
      </div>
    </label>
  )
}
