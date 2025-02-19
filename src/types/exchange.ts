export interface Balance {
    [currency: string]: number;
}

export interface AccountBalance {
    spot: Balance;
    futures?: Balance;
}

export interface ExchangeBalance {
    // 获取现货账户余额
    getSpotBalance(): Promise<Balance>;

    // 获取合约账户余额
    getFuturesBalance(): Promise<Balance>;

    // 计算账户总价值（USDT）
    calculateTotalValueInUsdt(balance: AccountBalance): Promise<{
        spot: number;
        futures: number;
        total: number;
    }>;
}

// 交易所凭证配置
export interface ExchangeCredentials {
    apiKey: string;
    secret: string;
    featureApiKey?: string;
    featureSecret?: string;
} 