import ccxt, { Exchange } from 'ccxt';
import { Balance, ExchangeBalance, AccountBalance, ExchangeCredentials } from '../types/exchange';
import { extractNonZeroBalance, calculateUsdtValue } from '../utils/balance';

export class BinanceExchange implements ExchangeBalance {
    private spotExchange: Exchange;
    private futuresExchange: Exchange;

    constructor(credentials: ExchangeCredentials) {
        this.spotExchange = new ccxt.binance({
            apiKey: credentials.apiKey,
            secret: credentials.secret
        });

        this.futuresExchange = new ccxt.binanceusdm({
            apiKey: credentials.apiKey,
            secret: credentials.secret
        });
    }

    async getSpotBalance(): Promise<Balance> {
        try {
            const balance = await this.spotExchange.fetchBalance();
            return extractNonZeroBalance(balance);
        } catch (e) {
            throw new Error('获取 Binance 现货账户余额失败:' + e);
        }
    }

    async getFuturesBalance(): Promise<Balance> {
        // 暂时不需要获取合约数据
        return {};
        // try {
        //     const balance = await this.futuresExchange.fetchBalance();
        //     return extractNonZeroBalance(balance);
        // } catch (e) {
        //     console.error('获取 Binance 合约账户余额失败:', e);
        //     return {};
        // }
    }

    async calculateTotalValueInUsdt(balance: AccountBalance): Promise<{
        spot: number;
        futures: number;
        total: number;
    }> {
        let spotValue = 0;
        try {
            spotValue = await calculateUsdtValue(balance.spot, this.spotExchange);
        } catch (e) {
            console.error('计算 Binance 现货价值失败:', e);
        }

        let futuresValue = 0;
        if (balance.futures) {
            try {
                futuresValue = await calculateUsdtValue(balance.futures, this.futuresExchange);
            } catch (e) {
                console.error('计算 Binance 合约价值失败:', e);
            }
        }

        return {
            spot: spotValue,
            futures: futuresValue,
            total: spotValue + futuresValue
        };
    }
} 