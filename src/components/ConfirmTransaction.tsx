import "./ConfirmTransaction.scss"

import React, { ReactElement } from "react"
import loadingGif from "../assets/loading.gif"
import { useTranslation } from "react-i18next"

function ConfirmTransaction(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="confirmTransaction">
      <span className="iconSaddle"></span>
      <h3>{t("confirmTransaction")}</h3>
      <img src={loadingGif} alt="loading..." className="loadingGif" />
    </div>
  )
}

export default ConfirmTransaction
