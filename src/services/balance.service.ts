import ccxt from 'ccxt';
import * as dotenv from 'dotenv';

dotenv.config();

interface BalanceResult {
  [currency: string]: number;
}

export class BalanceService {
  private kraken: ccxt.kraken;
  private binance: ccxt.binance;
  private gateio: ccxt.gateio;

  constructor() {
    this.initializeExchanges();
  }

  private initializeExchanges() {
    this.kraken = new ccxt.kraken({
      apiKey: process.env.KRAKEN_API_KEY,
      secret: process.env.KRAKEN_API_SECRET
    });

    this.binance = new ccxt.binance({
      apiKey: process.env.BINANCE_API_KEY,
      secret: process.env.BINANCE_API_SECRET
    });

    this.gateio = new ccxt.gateio({
      apiKey: process.env.GATEIO_API_KEY,
      secret: process.env.GATEIO_API_SECRET
    });
  }

  async getKrakenBalance() {
    try {
      const balance = await this.kraken.fetchBalance();
      return this.formatBalance(balance.total);
    } catch (error) {
      console.error('Error fetching Kraken balance:', error);
      return {};
    }
  }

  async getBinanceBalance() {
    try {
      const balance = await this.binance.fetchBalance();
      return this.formatBalance(balance.total);
    } catch (error) {
      console.error('Error fetching Binance balance:', error);
      return {};
    }
  }

  async getGateioBalance() {
    try {
      const balance = await this.gateio.fetchBalance();
      return this.formatBalance(balance.total);
    } catch (error) {
      console.error('Error fetching Gate.io balance:', error);
      return {};
    }
  }

  private formatBalance(balance: Record<string, any>): BalanceResult {
    const formattedBalance: BalanceResult = {};
    for (const [currency, amount] of Object.entries(balance)) {
      if (amount && Number(amount) > 0) {
        formattedBalance[currency] = Number(amount);
      }
    }
    return formattedBalance;
  }

  async getAllBalances(): Promise<{
    kraken: BalanceResult;
    binance: BalanceResult;
    gateio: BalanceResult;
  }> {
    const [krakenBalance, binanceBalance, gateioBalance] = await Promise.all([
      this.getKrakenBalance(),
      this.getBinanceBalance(),
      this.getGateioBalance()
    ]);

    return {
      kraken: krakenBalance,
      binance: binanceBalance,
      gateio: gateioBalance
    };
  }
}
