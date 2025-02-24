import "./PoolOverview.scss"

import {
  IS_SDL_LIVE,
  POOLS_MAP,
  PoolTypes,
  TOKENS_MAP,
  isMetaPool,
} from "../constants"
import { Partners, PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement } from "react"
import {
  formatBNToPercentString,
  formatBNToShortString,
  formatBNToString,
} from "../utils"

import Button from "./Button"
import { Link } from "react-router-dom"
import Tag from "./Tag"
import ToolTip from "./ToolTip"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import logo from "../assets/icons/logo.svg"
import { useTranslation } from "react-i18next"

interface Props {
  poolRoute: string
  poolData: PoolDataType
  userShareData: UserShareType | null
  onClickMigrate?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function PoolOverview({
  poolData,
  poolRoute,
  userShareData,
  onClickMigrate,
}: Props): ReactElement | null {
  const { t } = useTranslation()
  const { type: poolType, isOutdated } = POOLS_MAP[poolData.name]
  const formattedDecimals = poolType === PoolTypes.USD ? 2 : 4
  const shouldMigrate = !!onClickMigrate
  const formattedData = {
    name: poolData.name,
    reserve: poolData.reserve
      ? formatBNToShortString(poolData.reserve, 18)
      : "-",
    aprs: Object.keys(poolData.aprs).reduce((acc, key) => {
      const apr = poolData.aprs[key as Partners]?.apr
      return apr
        ? {
            ...acc,
            [key]: formatBNToPercentString(apr, 18),
          }
        : acc
    }, {} as Partial<Record<Partners, string>>),
    apy: poolData.apy ? `${formatBNToPercentString(poolData.apy, 18, 2)}` : "-",
    volume: poolData.volume
      ? `$${formatBNToShortString(poolData.volume, 18)}`
      : "-",
    userBalanceUSD: formatBNToShortString(
      userShareData?.usdBalance || Zero,
      18,
    ),
    sdlPerDay: formatBNToShortString(poolData?.sdlPerDay || Zero, 18),
    tokens: poolData.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        icon: token.icon,
        value: formatBNToString(coin.value, token.decimals, formattedDecimals),
      }
    }),
  }
  const hasShare = !!userShareData?.usdBalance.gt("0")
  const isMetapool = isMetaPool(formattedData.name)

  return (
    <div
      className={classNames("poolOverview", {
        outdated: isOutdated || shouldMigrate,
      })}
    >
      <div className="left">
        <div className="titleAndTag">
          {isMetapool ? (
            <ToolTip content={t("metapool")}>
              <h4 className="title underline">{formattedData.name}</h4>
            </ToolTip>
          ) : (
            <h4 className="title">{formattedData.name}</h4>
          )}
          {(shouldMigrate || isOutdated) && (
            <Tag kind="warning" size="large">
              OUTDATED
            </Tag>
          )}
          {poolData.isPaused && (
            <Tag kind="error" size="large">
              PAUSED
            </Tag>
          )}
        </div>
        {hasShare && (
          <div className="balance">
            <span>{t("balance")}: </span>
            <span>{`$${formattedData.userBalanceUSD}`}</span>
          </div>
        )}
        <div className="tokens">
          <span style={{ marginRight: "8px" }}>[</span>
          {formattedData.tokens.map(({ symbol, icon }) => (
            <div className="token" key={symbol}>
              <img alt="icon" className="tokenIcon" src={icon} />
              <span>{symbol}</span>
            </div>
          ))}
          <span style={{ marginLeft: "-8px" }}>]</span>
        </div>
      </div>

      <div className="right">
        <div className="poolInfo">
          {poolData.sdlPerDay != null && IS_SDL_LIVE && (
            <div className="margin">
              <span className="label">
                <a
                  href="https://blog.saddle.finance/introducing-sdl"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  SDL/24h
                </a>
              </span>
              <span>
                <img src={logo} className="tokenIcon" />
                {formattedData.sdlPerDay}
              </span>
            </div>
          )}
          {formattedData.apy && (
            <div className="margin">
              <span className="label">{`${t("apy")}`}</span>
              <span>{formattedData.apy}</span>
            </div>
          )}
          {Object.keys(poolData.aprs).map((key) => {
            const symbol = poolData.aprs[key as Partners]?.symbol as string
            return poolData.aprs[key as Partners]?.apr.gt(Zero) ? (
              <div className="margin Apr" key={symbol}>
                {symbol.includes("/") ? (
                  <span className="label underline">
                    <ToolTip content={symbol.replaceAll("/", "\n")}>
                      Reward APR
                    </ToolTip>
                  </span>
                ) : (
                  <span className="label">{symbol} APR</span>
                )}
                <span className="plus">
                  {formattedData.aprs[key as Partners] as string}
                </span>
              </div>
            ) : null
          })}
          <div className="margin">
            <span className="label">TVL</span>
            <span>{`$${formattedData.reserve}`}</span>
          </div>
          {formattedData.volume && (
            <div>
              <span className="label">{`${t("24HrVolume")}`}</span>
              <span>{formattedData.volume}</span>
            </div>
          )}
        </div>
        <div className="buttons">
          <Link to={`${poolRoute}/withdraw`}>
            <Button kind="secondary">{t("withdraw")}</Button>
          </Link>
          {shouldMigrate ? (
            <Button
              kind="temporary"
              onClick={onClickMigrate}
              disabled={!hasShare}
            >
              {t("migrate")}
            </Button>
          ) : (
            <Link to={`${poolRoute}/deposit`}>
              <Button
                kind="primary"
                disabled={poolData?.isPaused || isOutdated}
              >
                {t("deposit")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
