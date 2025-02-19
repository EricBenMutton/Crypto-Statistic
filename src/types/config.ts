export interface ExchangeConfig {
    apiKey: string;
    secret: string;
}

export type ExchangeName = 'binance' | 'kraken' | 'gateio';

export interface Config {
    exchanges: {
        [K in ExchangeName]?: ExchangeConfig;
    };
}