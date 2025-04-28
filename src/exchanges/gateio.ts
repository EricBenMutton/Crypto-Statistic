import ccxt, { Exchange } from 'ccxt';
import { Balance, ExchangeBalance, AccountBalance, ExchangeCredentials } from '../types/exchange';
import { extractNonZeroBalance, calculateUsdtValue } from '../utils/balance';
import { ApiClient, WalletApi } from 'gate-api';

export class GateioExchange implements ExchangeBalance {
    private spotExchange: Exchange;
    private futuresExchange: Exchange;
    private walletApi: WalletApi;
    private balance = 0;

    constructor(credentials: ExchangeCredentials) {
        this.spotExchange = new ccxt.gateio({
            apiKey: credentials.apiKey,
            secret: credentials.secret
        });

        this.futuresExchange = new ccxt.gateio({
            apiKey: credentials.apiKey,
            secret: credentials.secret,
            options: { defaultType: 'future' }
        });

        const client = new ApiClient();
        client.setApiKeySecret(credentials.apiKey, credentials.secret);
        this.walletApi = new WalletApi(client);
    }

    async getSpotBalance(): Promise<Balance> {
        try {
            const balance = await this.spotExchange.fetchBalance();
            const response = await this.walletApi.getTotalBalance({ currency: 'USDT' });
            this.balance = parseFloat(response.body.total?.amount || '0');
            return extractNonZeroBalance(balance);
        } catch (e) {
            throw new Error('获取 Gate.io 现货账户余额失败:' + e);
        }
    }

    async getFuturesBalance(): Promise<Balance> {
        // 暂时不需要获取合约数据
        return {};
        // try {
        //     const balance = await this.futuresExchange.fetchBalance();
        //     return extractNonZeroBalance(balance);
        // } catch (e) {
        //     console.error('获取 Gate.io 合约账户余额失败:', e);
        //     return {};
        // }
    }

    async calculateTotalValueInUsdt(balance: AccountBalance): Promise<{
        spot: number;
        futures: number;
        total: number;
    }> {
        // let spotValue = 0;
        // try {
        //     spotValue = await calculateUsdtValue(balance.spot, this.spotExchange);
        // } catch (e) {
        //     console.error('计算 Gate.io 现货价值失败:', e);
        // }

        // let futuresValue = 0;
        // if (balance.futures) {
        //     try {
        //         futuresValue = await calculateUsdtValue(balance.futures, this.futuresExchange);
        //     } catch (e) {
        //         console.error('计算 Gate.io 合约价值失败:', e);
        //     }
        // }

        return {
            spot: this.balance,
            futures: 0,
            total: this.balance
        };
    }
} 