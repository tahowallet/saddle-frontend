import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import Divider from "./Divider"
import { SWAP_TYPES } from "../constants"
import type { TokenOption } from "../pages/Swap"
import classnames from "classnames"
import { commify } from "../utils"
import { formatBNToString } from "../utils"
import styles from "./SearchSelect.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  tokensData: TokenOption[]
  onSelect: (symbol: string) => void
  value?: string
}

export default function SearchSelect({
  tokensData,
  onSelect,
}: Props): ReactElement {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const focusedItemRef = useRef<HTMLLIElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (inputRef?.current != null) {
      inputRef.current.focus()
    }
  }, [inputRef])
  useEffect(() => {
    // scroll active li into view if user got there via keyboard nav
    if (focusedItemRef?.current != null) {
      focusedItemRef.current.scrollIntoView()
    }
  }, [focusedItemRef, activeIndex])
  const filteredTokens = useMemo(() => {
    // filter tokens by user input
    return tokensData.filter(({ symbol, name }) => {
      const target = searchTerm.toLowerCase()
      return (
        symbol.toLowerCase().includes(target) ||
        name.toLowerCase().includes(target)
      )
    })
  }, [tokensData, searchTerm])
  const lastSelectableIndex = useMemo(() => {
    // find the last idx of isAvailable tokens
    const lastAvailableIndex =
      filteredTokens.findIndex(({ isAvailable }) => isAvailable === false) - 1
    return lastAvailableIndex < 0
      ? filteredTokens.length - 1
      : lastAvailableIndex
  }, [filteredTokens])

  return (
    <div className={styles.searchSelect}>
      <div className={styles.inputContainer}>
        <span className="iconSearch"></span>
        <input
          value={searchTerm}
          onChange={(e) => {
            const inputValue = e.target.value
            const nextActiveIndex = inputValue === "" ? null : 0
            activeIndex !== nextActiveIndex && setActiveIndex(nextActiveIndex)
            setSearchTerm(inputValue)
          }}
          ref={inputRef}
          onFocus={() => activeIndex != null && setActiveIndex(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && activeIndex != null) {
              const token = filteredTokens[activeIndex]
              token.isAvailable && onSelect(token.symbol)
            } else if (e.key === "ArrowUp") {
              setActiveIndex((prev) =>
                prev === null || prev === 0 ? null : Math.max(0, prev - 1),
              )
            } else if (e.key === "ArrowDown") {
              setActiveIndex((prev) =>
                prev === null ? 0 : Math.min(lastSelectableIndex, prev + 1),
              )
            }
          }}
        />
      </div>
      <ul className={styles.listContainer}>
        {filteredTokens.map((item, i) => {
          return (
            <li
              key={item.symbol}
              onClick={() => item.isAvailable && onSelect(item.symbol)}
              ref={i === activeIndex ? focusedItemRef : null}
            >
              <Divider />
              <ListItem {...item} isActive={i === activeIndex} />
            </li>
          )
        })}
        {filteredTokens.length === 0 ? (
          <li className={styles.listItem}>{t("noTokensFound")}</li>
        ) : null}
      </ul>
    </div>
  )
}

function ListItem({
  amount,
  valueUSD,
  name,
  icon,
  symbol,
  decimals,
  isActive,
  isAvailable,
  swapType,
}: TokenOption & { isActive: boolean }) {
  const { t } = useTranslation()
  const isVirtualSwap = ([
    SWAP_TYPES.SYNTH_TO_SYNTH,
    SWAP_TYPES.SYNTH_TO_TOKEN,
    SWAP_TYPES.TOKEN_TO_SYNTH,
    SWAP_TYPES.TOKEN_TO_TOKEN,
  ] as Array<SWAP_TYPES | null>).includes(swapType)
  return (
    <div
      className={classnames(styles.listItem, {
        [styles.isActive]: isActive,
        [styles.isUnavailable]: !isAvailable,
        [styles.isAvailable]: isAvailable,
      })}
    >
      <img src={icon} height="24px" width="24px" />
      <div>
        <div className={styles.tagWrapper}>
          <b>{symbol}</b>
          {!isAvailable && (
            <span className={styles.unavailableTag}>{t("unavailable")}</span>
          )}
          {isAvailable && isVirtualSwap && (
            <span className={styles.virtualSwapTag}>{t("virtualSwap")}</span>
          )}
        </div>
        <p className={styles.textMinor}>{name}</p>
      </div>
      <div>
        <p>{commify(formatBNToString(amount, decimals))}</p>
        <p className={styles.textMinor}>
          ≈${commify(formatBNToString(valueUSD, 18, 2))}
        </p>
      </div>
    </div>
  )
}
