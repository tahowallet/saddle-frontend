import "./AccountDetails.scss"

import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"
import Copy from "./Copy"
import Identicon from "./Identicon"
import { SUPPORTED_WALLETS } from "../constants"
import Transactions from "./Transactions"
import { Zero } from "@ethersproject/constants"
import { find } from "lodash"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { shortenAddress } from "../utils/shortenAddress"
import { useActiveWeb3React } from "../hooks"
import { usePoolTokenBalances } from "../state/wallet/hooks"
import { useTranslation } from "react-i18next"

interface Props {
  openOptions: () => void
}

export default function AccountDetail({ openOptions }: Props): ReactElement {
  const { t } = useTranslation()
  const { account, connector } = useActiveWeb3React()
  const tokenBalances = usePoolTokenBalances()
  const ethBalanceFormatted = commify(
    formatBNToString(tokenBalances?.ETH || Zero, 18, 6),
  )

  const connectorName = find(SUPPORTED_WALLETS, ["connector", connector])?.name

  return (
    <div className="accountDetail">
      <div className="upperSection">
        <h3 className="accountTitle">{t("account")}</h3>
        <div className="accountControl">
          <span className="label">
            {t("connectedWith")}&nbsp;
            {connectorName}
          </span>
          <span className="label">{t("balance")}</span>
          <div className="data">
            <Identicon />
            <span className="address">
              {account && shortenAddress(account)}
            </span>
            {account && (
              <a
                href={getEtherscanLink(account, "address")}
                target="_blank"
                rel="noreferrer"
              >
                <span className="iconWithdraw"></span>
              </a>
            )}
          </div>
          <span className="data">{ethBalanceFormatted}&#926;</span>
          <div className="buttonGroup">
            {account && (
              <Copy toCopy={account}>
                <span className="textStyle">{t("copyAddress")}</span>
              </Copy>
            )}
          </div>
          <div className="buttonGroup">
            <button
              className="textStyle"
              onClick={() => {
                openOptions()
              }}
            >
              {/* change Icon */}
              <span className="iconChange"></span>
              {t("changeAccount")}
            </button>
          </div>
        </div>
      </div>

      <div className="lowerSection">
        <Transactions />
      </div>
    </div>
  )
}
