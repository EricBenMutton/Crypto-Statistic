import ccxt, { Exchange } from 'ccxt';
import { Balance, ExchangeBalance, AccountBalance, ExchangeCredentials } from '../types/exchange';
import { extractNonZeroBalance } from '../utils/balance';

export class KrakenExchange implements ExchangeBalance {
    private spotExchange: Exchange;
    private futuresExchange: Exchange;
    private featurePnl: number = 0;

    constructor(credentials: ExchangeCredentials) {
        this.spotExchange = new ccxt.kraken({
            apiKey: credentials.apiKey,
            secret: credentials.secret
        });

        this.futuresExchange = new ccxt.krakenfutures({
            apiKey: credentials.featureApiKey,
            secret: credentials.featureSecret
        });
    }

    async getSpotBalance(): Promise<Balance> {
        try {
            const balance = await this.spotExchange.fetchBalance();
            return extractNonZeroBalance(balance);
        } catch (e) {
            throw new Error('获取 Kraken 现货账户余额失败:' + e);
        }
    }

    async getFuturesBalance(): Promise<Balance> {
        try {
            const balance = await this.futuresExchange.fetchBalance();
            this.featurePnl = parseFloat(balance.info.accounts.flex.pnl);
            return extractNonZeroBalance(balance);
        } catch (e) {
            throw new Error('获取 Kraken 合约账户余额失败:' + e);
        }
    }

    async calculateUsdValue(
        balance: Balance,
    ): Promise<number> {
        let totalValue = 0;

        for (const [currency, amount] of Object.entries(balance)) {
            if (currency.startsWith('USD')) {
                totalValue += amount;
            } else {
                try {
                    const ticker = await this.spotExchange.fetchTicker(`${currency}/USD`);
                    if (ticker.last) {
                        totalValue += amount * ticker.last;
                    }
                } catch {
                    // 忽略错误，继续计算其他货币
                    continue;
                }
            }
        }

        return totalValue;
    }

    async calculateTotalValueInUsdt(balance: AccountBalance): Promise<{
        spot: number;
        futures: number;
        total: number;
    }> {
        let spotValue = 0;
        try {
            spotValue = await this.calculateUsdValue(balance.spot);
        } catch (e) {
            console.error('计算 Kraken 现货价值失败:', e);
        }

        let futuresValue = 0;
        if (balance.futures) {
            try {
                futuresValue = await this.calculateUsdValue(balance.futures);
            } catch (e) {
                console.error('计算 Kraken 合约价值失败:', e);
            }
        }

        return {
            spot: spotValue,
            futures: futuresValue + this.featurePnl,
            total: spotValue + futuresValue
        };
    }
} 