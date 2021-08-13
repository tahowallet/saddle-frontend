import "./Transactions.scss"
import React, { ReactElement, useCallback, useEffect, useState } from "react"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { getFormattedShortTime } from "../utils/dateTime"
import { getPoolByAddress } from "../utils/getPoolByAddress"
import { useActiveWeb3React } from "../hooks"
import { useTranslation } from "react-i18next"

interface Response {
  data: {
    addLiquidityEvents: [
      {
        swap: {
          id: string
        }
        timestamp: string
        transaction: string
      },
    ]
    removeLiquidityEvents: [
      {
        swap: {
          id: string
        }
        timestamp: string
        transaction: string
      },
    ]
    swaps: [
      {
        address: string
        exchanges: [
          {
            boughtId: string
            tokensBought: string
            soldId: string
            tokensSold: string
            timestamp: string
            transaction: string
          },
        ]
      },
    ]
  }
}

interface Transaction {
  object: string
  transaction: string
  time: string
  timestamp: number
  status?: string
}

export default function Transactions(): ReactElement {
  const SADDLE_SUBGRAPH_URL =
    "https://api.thegraph.com/subgraphs/name/saddle-finance/saddle"
  const { t } = useTranslation()
  const { chainId, account } = useActiveWeb3React()
  const [transactionList, setTransactionList] = useState<Transaction[]>([])

  const fetchTxn = useCallback(async () => {
    if (!account || !chainId) return

    const newTransactionList: Transaction[] = []
    const time24Hrs = Math.floor(Date.now() / 1000) - 60 * 60 * 24 // 24hrs
    const query = `
      {
        addLiquidityEvents(where:{provider: "${account}", timestamp_gte: ${time24Hrs}}) {
          swap {
            id
          }
          transaction
          timestamp
        }
        removeLiquidityEvents(where:{provider:"${account}", timestamp_gte: ${time24Hrs}}) {
          swap {
            id
          }
          transaction
          timestamp
        }
        swaps {
          address
          exchanges(where:{buyer:"${account}", timestamp_gte: ${time24Hrs}}) {
            boughtId
            soldId
            timestamp
            transaction
          }
        }
      }
    `

    await fetch(SADDLE_SUBGRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((result: Response) => {
        const { addLiquidityEvents, removeLiquidityEvents, swaps } = result.data
        addLiquidityEvents.map((event) => {
          const poolName = getPoolByAddress(event.swap.id, chainId)?.name
          if (poolName) {
            newTransactionList.push({
              object: `${t("depositIn")} ${poolName}`,
              transaction: event.transaction,
              time: getFormattedShortTime(event.timestamp),
              timestamp: parseInt(event.timestamp),
            })
          }
        })

        removeLiquidityEvents.map((event) => {
          const poolName = getPoolByAddress(event.swap.id, chainId)?.name
          if (poolName) {
            newTransactionList.push({
              object: `${t("withdrawFrom")} ${poolName}`,
              transaction: event.transaction,
              time: getFormattedShortTime(event.timestamp),
              timestamp: parseInt(event.timestamp),
            })
          }
        })

        swaps.map(({ address, exchanges }) => {
          const poolTokens = getPoolByAddress(address, chainId)?.poolTokens
          if (exchanges && poolTokens) {
            exchanges.map(({ soldId, boughtId, transaction, timestamp }) => {
              const soldToken = poolTokens[parseInt(soldId)].symbol
              const boughtToken = poolTokens[parseInt(boughtId)].symbol

              newTransactionList.push({
                object: `${t("swap")} ${soldToken} ${t("toBe")} ${boughtToken}`,
                transaction: transaction,
                time: getFormattedShortTime(timestamp),
                timestamp: parseInt(timestamp),
              })
            })
          }
        })
        setTransactionList(
          newTransactionList.sort((a, b) => b.timestamp - a.timestamp),
        )
      })
      .catch(console.error)
  }, [chainId, t, account])

  useEffect(() => {
    void fetchTxn()
  }, [fetchTxn])

  return (
    <>
      <div className="titleRow">
        <h4 className="txn">{t("recentTransactions")}</h4>
        <button
          className="textStyle clear"
          onClick={(): void => {
            setTransactionList([])
          }}
        >
          {t("clear")}
        </button>
      </div>
      <div className="transactionList">
        {transactionList.length !== 0 ? (
          transactionList.map((txn, index) => (
            <div key={index} className="transactionItem">
              <span className="transactionObject">{txn.object}</span>
              <a
                href={getEtherscanLink(txn.transaction, "tx")}
                target="_blank"
                rel="noreferrer"
                className="transactionLink"
              >
                <span className="iconWithdraw"></span>
              </a>
              <span className="transactionTime">{txn.time}</span>
            </div>
          ))
        ) : (
          <span style={{ fontSize: "16px" }}>
            {t("yourRecentTransactions")}
          </span>
        )}
      </div>
    </>
  )
}
