import "./SwapPage.scss"

import { Button, Center } from "@chakra-ui/react"
import React, { ReactElement, useMemo, useState } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import ConfirmTransaction from "./ConfirmTransaction"
import DeadlineField from "./DeadlineField"
import GasField from "./GasField"
import InfiniteApprovalField from "./InfiniteApprovalField"
import Modal from "./Modal"
import { PayloadAction } from "@reduxjs/toolkit"
import { PendingSwap } from "../hooks/usePendingSwapData"
import ReviewSwap from "./ReviewSwap"
import SlippageField from "./SlippageField"
import SwapInput from "./SwapInput"
import type { TokenOption } from "../pages/Swap"
import TopMenu from "./TopMenu"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { commify } from "../utils"
import { formatUnits } from "@ethersproject/units"
import { isHighPriceImpact } from "../utils/priceImpact"
import { logEvent } from "../utils/googleAnalytics"
import { updateSwapAdvancedMode } from "../state/user"
import { useActiveWeb3React } from "../hooks"
import { useTranslation } from "react-i18next"

interface Props {
  tokenOptions: {
    from: TokenOption[]
    to: TokenOption[]
  }
  exchangeRateInfo: {
    pair: string
    exchangeRate: BigNumber
    priceImpact: BigNumber
    route: string[]
  }
  txnGasCost: {
    amount: BigNumber
    valueUSD: BigNumber | null // amount * ethPriceUSD
  }
  error: string | null
  fromState: { symbol: string; value: string; valueUSD: BigNumber }
  toState: { symbol: string; value: string; valueUSD: BigNumber }
  pendingSwaps: PendingSwap[]
  onChangeFromToken: (tokenSymbol: string) => void
  onChangeFromAmount: (amount: string) => void
  onChangeToToken: (tokenSymbol: string) => void
  onConfirmTransaction: () => Promise<void>
  onClickReverseExchangeDirection: () => void
}

const SwapPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()
  const {
    tokenOptions,
    exchangeRateInfo,
    txnGasCost,
    error,
    fromState,
    toState,
    pendingSwaps,
    onChangeFromToken,
    onChangeFromAmount,
    onChangeToToken,
    onConfirmTransaction,
    onClickReverseExchangeDirection,
  } = props

  const [currentModal, setCurrentModal] = useState<string | null>(null)

  const fromToken = useMemo(() => {
    return tokenOptions.from.find(({ symbol }) => symbol === fromState.symbol)
  }, [tokenOptions.from, fromState.symbol])

  const dispatch = useDispatch<AppDispatch>()
  const { userSwapAdvancedMode: advanced } = useSelector(
    (state: AppState) => state.user,
  )
  const formattedPriceImpact = commify(
    formatBNToPercentString(exchangeRateInfo.priceImpact, 18),
  )
  const formattedExchangeRate = commify(
    formatBNToString(exchangeRateInfo.exchangeRate, 18, 6),
  )
  const formattedRoute = exchangeRateInfo.route.join(" > ")
  const formattedBalance = commify(
    formatBNToString(fromToken?.amount || Zero, fromToken?.decimals || 0, 6),
  )

  return (
    <div className="swapPage">
      <TopMenu activeTab={"swap"} />
      <div className="content">
        <div className="swapForm">
          <div className="row">
            <h3 className="swapTitle">{t("from")}</h3>
            <div className="balanceContainer">
              <span>{t("balance")}:</span>
              &nbsp;
              <a
                onClick={() => {
                  if (fromToken == null) return
                  const amtStr = formatBNToString(
                    fromToken.amount,
                    fromToken.decimals || 0,
                  )
                  onChangeFromAmount(amtStr)
                }}
              >
                {formattedBalance}
              </a>
            </div>
          </div>
          <div className="row">
            <SwapInput
              tokens={tokenOptions.from.filter(
                ({ symbol }) => symbol !== toState.symbol,
              )}
              onSelect={onChangeFromToken}
              onChangeAmount={onChangeFromAmount}
              selected={fromState.symbol}
              inputValue={fromState.value}
              inputValueUSD={fromState.valueUSD}
              isSwapFrom={true}
            />
          </div>
          <div style={{ height: "48px" }}></div>
          <div className="row">
            <h3 className="swapTitle">{t("to")}</h3>
          </div>
          <div className="row">
            <SwapInput
              tokens={tokenOptions.to.filter(
                ({ symbol }) => symbol !== fromState.symbol,
              )}
              onSelect={onChangeToToken}
              selected={toState.symbol}
              inputValue={toState.value}
              inputValueUSD={toState.valueUSD}
              isSwapFrom={false}
            />
          </div>
          <div style={{ height: "24px" }}></div>
          {fromState.symbol && toState.symbol && (
            <div className="row">
              <div>
                <span>{t("rate")}</span>
                &nbsp;
                <span>{exchangeRateInfo.pair}</span>
                &nbsp;
                <button
                  className="exchange"
                  onClick={onClickReverseExchangeDirection}
                >
                  <span className="iconSwap"></span>
                </button>
              </div>
              <span className="exchRate">{formattedExchangeRate}</span>
            </div>
          )}
          <div className="row">
            <span>{t("priceImpact")}</span>
            <span>{formattedPriceImpact}</span>
          </div>
          {formattedRoute && (
            <div className="row">
              <span>{t("route")}</span>
              <span>{formattedRoute}</span>
            </div>
          )}
        </div>
        {account && isHighPriceImpact(exchangeRateInfo.priceImpact) ? (
          <div className="exchangeWarning">
            {t("highPriceImpact", {
              rate: formattedPriceImpact,
            })}
          </div>
        ) : null}
        <div className="infoSection">
          <div
            className="title"
            onClick={(): PayloadAction<boolean> =>
              dispatch(updateSwapAdvancedMode(!advanced))
            }
          >
            {t("advancedOptions")}
            {/* When advanced = true, icon will be upside down */}
            <span
              className={classNames({ iconArrow: true, upsideDown: advanced })}
            ></span>
          </div>
        </div>
        <div className="advancedOptions">
          <div className={"tableContainer " + classNames({ show: advanced })}>
            <div className="table">
              <div className="parameter">
                <InfiniteApprovalField />
              </div>
              <div className="parameter">
                <SlippageField />
              </div>
              <div className="parameter">
                <DeadlineField />
              </div>
              <div className="parameter">
                <GasField />
              </div>
            </div>
          </div>
        </div>
        <div className="pendingSwaps">
          {pendingSwaps.map((pendingSwap) => {
            const formattedSynthBalance = commify(
              formatUnits(
                pendingSwap.synthBalance,
                pendingSwap.synthTokenFrom.decimals,
              ),
            )
            return (
              <div
                className="pendingSwapItem"
                key={pendingSwap.itemId?.toString()}
              >
                <span className="swapDetails">
                  {formattedSynthBalance} {pendingSwap.synthTokenFrom.symbol}{" "}
                  {"->"} {pendingSwap.tokenTo.symbol}
                </span>
                <div className="swapTimeContainer">
                  <span className="iconClock"></span>
                  <span className="swapTime">
                    {Math.ceil(pendingSwap.secondsRemaining / 60)} min.
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <Center width="100%" py={6}>
          <Button
            variant="primary"
            size="lg"
            width="240px"
            onClick={(): void => {
              setCurrentModal("review")
            }}
            disabled={!!error || +toState.value <= 0}
          >
            {t("swap")}
          </Button>
        </Center>
        <div className={classNames({ showError: !!error }, "error")}>
          {error}
        </div>
        <Modal
          isOpen={!!currentModal}
          onClose={(): void => setCurrentModal(null)}
        >
          {currentModal === "review" ? (
            <ReviewSwap
              onClose={(): void => setCurrentModal(null)}
              onConfirm={async (): Promise<void> => {
                setCurrentModal("confirm")
                logEvent("swap", {
                  from: fromState.symbol,
                  to: toState.symbol,
                })
                await onConfirmTransaction?.()
                setCurrentModal(null)
              }}
              data={{
                from: fromState,
                to: toState,
                exchangeRateInfo,
                txnGasCost,
              }}
            />
          ) : null}
          {currentModal === "confirm" ? <ConfirmTransaction /> : null}
        </Modal>
      </div>
    </div>
  )
}
export default SwapPage
