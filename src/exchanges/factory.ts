import { ExchangeBalance, ExchangeCredentials } from '../types/exchange';
import { BinanceExchange } from './binance';
import { GateioExchange } from './gateio';
import { KrakenExchange } from './kraken';
import { ExchangeName } from '../types/config';
export class ExchangeFactory {
    private static exchanges: Map<ExchangeName, ExchangeBalance> = new Map();

    static createExchange(name: ExchangeName, credentials: ExchangeCredentials): ExchangeBalance {
        let exchange = this.exchanges.get(name);

        if (!exchange) {
            switch (name) {
                case 'binance':
                    exchange = new BinanceExchange(credentials);
                    break;
                case 'gateio':
                    exchange = new GateioExchange(credentials);
                    break;
                case 'kraken':
                    exchange = new KrakenExchange(credentials);
                    break;
                default:
                    throw new Error(`不支持的交易所: ${name}`);
            }
            this.exchanges.set(name, exchange);
        }

        return exchange;
    }

    static getExchange(name: ExchangeName): ExchangeBalance | undefined {
        return this.exchanges.get(name);
    }

    static getAllExchanges(): Map<ExchangeName, ExchangeBalance> {
        return this.exchanges;
    }

    static clearExchanges(): void {
        this.exchanges.clear();
    }
} 