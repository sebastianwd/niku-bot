import CoinGecko from 'coingecko-api'
import { values } from 'es-toolkit/compat'
import got from 'got'

import { config } from '~/constants'
import { log } from '~/utils/logger'

interface CMCQuoteResponse {
  data: {
    [key: string]: {
      name: string
      symbol: string
      slug: string
      quote: {
        USD: {
          price: number
          percent_change_24h: number
          percent_change_7d: number
        }
      }
    }
  }
}

export interface TokenPrice {
  name: string
  price?: string
  percentChange24h?: string
}

function formatPrice(price: number) {
  return price.toFixed(20).match(/^-?\d*\.?0*\d{0,3}/)?.[0]
}

function formatPercentageChange(number: number) {
  return `${number > 0 ? '+' : ''}${number.toFixed(2)}`
}

export class CryptoService {
  private cgClient: CoinGecko

  constructor() {
    this.cgClient = new CoinGecko()
  }

  public async getPrice(tokenName: string): Promise<TokenPrice> {
    const getToken = async () => {
      try {
        if (!config.CMC_API_KEY) {
          log.warn('CMC_API_KEY is not set, using CoinGecko API instead')
        }

        const cmcResponse = await got
          .get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            headers: {
              'X-CMC_PRO_API_KEY': config.CMC_API_KEY,
            },
            searchParams: {
              slug: tokenName,
            },
          })
          .json<CMCQuoteResponse>()

        const [token] = values(cmcResponse.data)

        return {
          price: token.quote.USD.price,
          percentChange24h: token.quote.USD.percent_change_24h,
        }
      } catch {
        const cgResponse = await this.cgClient.simple.price({
          ids: tokenName,
          vs_currencies: 'usd',
          include_24hr_change: true,
        })

        return {
          price: cgResponse.data[tokenName]?.usd,
          percentChange24h: cgResponse.data[tokenName]?.usd_24h_change,
        }
      }
    }

    const token = await getToken()

    return {
      name: tokenName,
      price: token.price ? formatPrice(token.price) : undefined,
      percentChange24h: token.percentChange24h ? formatPercentageChange(token.percentChange24h) : undefined,
    }
  }
}
