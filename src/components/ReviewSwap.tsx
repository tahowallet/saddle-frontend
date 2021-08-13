import "./ReviewSwap.scss"

import React, { ReactElement, useState } from "react"
import { commify, formatBNToString, formatDeadlineToNumber } from "../utils"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "./Button"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import { TOKENS_MAP } from "../constants"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  data: {
    from: { symbol: string; value: string }
    to: { symbol: string; value: string }
    exchangeRateInfo: {
      pair: string
      priceImpact: BigNumber
      exchangeRate: BigNumber
    }
    txnGasCost: {
      amount: BigNumber
      valueUSD: BigNumber | null // amount * ethPriceUSD
    }
  }
}

function ReviewSwap({ onClose, onConfirm, data }: Props): ReactElement {
  const { t } = useTranslation()
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  } = useSelector((state: AppState) => state.user)
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const [
    hasConfirmedHighPriceImpact,
    setHasConfirmedHighPriceImpact,
  ] = useState(false)
  const fromToken = TOKENS_MAP[data.from.symbol]
  const toToken = TOKENS_MAP[data.to.symbol]
  const isHighPriceImpactTxn = isHighPriceImpact(
    data.exchangeRateInfo.priceImpact,
  )
  const deadline = formatDeadlineToNumber(
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  )

  return (
    <div className="reviewSwap">
      <h3>{t("reviewSwap")}</h3>
      <div className="swapTable">
        <div className="from">
          <img className="tokenIcon" src={fromToken.icon} alt="icon" />
          <span className="tokenName">{data.from.symbol}</span>
          <div className="floatRight">
            <span>{data.from.value}</span>
          </div>
        </div>
        <span className="iconArrowDown"></span>
        <div className="to">
          <img className="tokenIcon" src={toToken.icon} alt="icon" />
          <span className="tokenName">{data.to.symbol}</span>
          <div className="floatRight">
            <span>{data.to.value}</span>
          </div>
        </div>
        <div className="divider" style={{ height: "1px", width: "100%" }} />
        <div className="swapInfo">
          <div className="priceTable">
            <span className="title">{t("price")}</span>
            <span className="pair">{data.exchangeRateInfo.pair}</span>
            <button className="exchange">
              <span className="iconSwap"></span>
            </button>
            <span className="value floatRight">
              {formatBNToString(data.exchangeRateInfo.exchangeRate, 18, 4)}
            </span>
          </div>
          <div className="row">
            <span className="title">{t("gas")}</span>
            <span className="value floatRight">
              {formatGasToString(
                { gasStandard, gasFast, gasInstant },
                gasPriceSelected,
                gasCustom,
              )}{" "}
              GWEI
            </span>
          </div>
          {data.txnGasCost?.valueUSD && (
            <div className="row">
              <span className="title">{t("estimatedTxCost")}</span>
              <span className="value floatRight">
                {`≈$${commify(
                  formatBNToString(data.txnGasCost.valueUSD, 2, 2),
                )}`}
              </span>
            </div>
          )}
          <div className="row">
            <span className="title">{t("maxSlippage")}</span>
            <span className="value floatRight">
              {formatSlippageToString(slippageSelected, slippageCustom)}%
            </span>
          </div>
          <div className="row">
            <span className="title">{t("deadline")}</span>
            <span className="value floatRight">
              {deadline} {t("minutes")}
            </span>
          </div>
          {isHighPriceImpactTxn && (
            <div className="row">
              <HighPriceImpactConfirmation
                checked={hasConfirmedHighPriceImpact}
                onCheck={(): void =>
                  setHasConfirmedHighPriceImpact((prevState) => !prevState)
                }
              />
            </div>
          )}
        </div>
      </div>
      <div className="bottom">
        <p>{t("estimatedOutput")}</p>
        <div className="buttonWrapper">
          <Button
            onClick={onConfirm}
            kind="primary"
            disabled={isHighPriceImpactTxn && !hasConfirmedHighPriceImpact}
          >
            {t("confirmSwap")}
          </Button>
          <Button onClick={onClose} kind="cancel">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReviewSwap
