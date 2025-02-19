import dotenv from 'dotenv';
import { ExchangeCredentials } from './types/exchange';
import { ExchangeName } from './types/config';

// 加载 .env 文件
dotenv.config();

function getExchangeConfigFromEnv(prefix: string): ExchangeCredentials | undefined {
    const apiKey = process.env[`${prefix}_API_KEY`];
    const secret = process.env[`${prefix}_API_SECRET`];
    const featureApiKey = process.env[`${prefix}_FEATURE_API_KEY`];
    const featureSecret = process.env[`${prefix}_FEATURE_API_SECRET`];

    if (!apiKey || !secret) {
        return undefined;
    }

    return { apiKey, secret, featureApiKey, featureSecret };
}

export type ExchangeConfigs = Partial<Record<ExchangeName, ExchangeCredentials>>;

export function loadConfig(): ExchangeConfigs {
    const config: ExchangeConfigs = {};

    // 从环境变量加载各交易所配置
    const exchanges: ExchangeName[] = ['binance', 'kraken', 'gateio'];

    exchanges.forEach(exchange => {
        const exchangeConfig = getExchangeConfigFromEnv(exchange.toUpperCase());
        if (exchangeConfig) {
            config[exchange] = exchangeConfig;
        }
    });

    if (Object.keys(config).length === 0) {
        throw new Error('未找到有效的交易所配置。请在环境变量中设置交易所的 API 密钥。');
    }

    return config;
}