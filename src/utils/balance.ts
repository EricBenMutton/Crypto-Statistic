import { Exchange } from 'ccxt';
import { Balance } from '../types/exchange';

export function extractNonZeroBalance(balanceData: any): Balance {
    const totalBalance: Balance = {};

    if (balanceData.total) {
        Object.entries(balanceData.total).forEach(([currency, amount]) => {
            const numAmount = Number(amount);
            if (numAmount > 0) {
                totalBalance[currency] = numAmount;
            }
        });
    }

    return totalBalance;
}

export async function calculateUsdtValue(
    balance: Balance,
    exchange: Exchange,
    currencySymbol?: (currency: string) => string
): Promise<number> {
    let totalValue = 0;

    for (const [currency, amount] of Object.entries(balance)) {
        if (currency === 'USDT') {
            totalValue += amount;
        } else {
            try {
                const ticker = await exchange.fetchTicker(`${currencySymbol ? currencySymbol(currency) : currency}/USDT`);
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