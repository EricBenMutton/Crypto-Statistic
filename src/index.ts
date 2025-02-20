import { loadConfig } from './config';
import { ExchangeFactory } from './exchanges/factory';
import { ExchangeName } from './types/config';
import { AccountBalance, ExchangeBalance } from './types/exchange';
import { updateTable } from './feishu';

interface TotalBalance {
    [exchange: string]: AccountBalance;
}

async function getExchangeBalance(exchange: ExchangeBalance): Promise<AccountBalance> {
    const spot = await exchange.getSpotBalance();
    const futures = await exchange.getFuturesBalance();

    return {
        spot,
        ...(Object.keys(futures).length > 0 ? { futures } : {})
    };
}

async function main() {
    try {
        // 加载配置
        const config = loadConfig();

        // 初始化交易所
        Object.entries(config).forEach(([name, credentials]) => {
            ExchangeFactory.createExchange(name as ExchangeName, credentials);
            console.log(`已配置 ${name.toUpperCase()} 交易所`);
        });

        // 获取所有交易所的余额
        const balances: TotalBalance = {};
        for (const [name, exchange] of ExchangeFactory.getAllExchanges()) {
            const balance = await getExchangeBalance(exchange);
            if (Object.keys(balance.spot).length > 0 || (balance.futures && Object.keys(balance.futures).length > 0)) {
                balances[name] = balance;
            }
        }

        // 显示余额
        let totalSpot = 0;
        let totalFutures = 0;

        const exchangeTotalMap = new Map<string, number>();

        console.log('\n各交易所账户余额:');
        for (const [exchangeName, balance] of Object.entries(balances)) {
            console.log(`\n💰💰💰💰💰💰💰💰💰💰 ${exchangeName.toUpperCase()} 💰💰💰💰💰💰💰💰💰💰`);

            // 显示现货账户余额
            console.log('现货账户:');
            for (const [currency, amount] of Object.entries(balance.spot)) {
                console.log(`  ${currency}: ${amount}`);
            }

            // 显示合约账户余额
            if (balance.futures && Object.keys(balance.futures).length > 0) {
                console.log('\n合约账户:');
                for (const [currency, amount] of Object.entries(balance.futures)) {
                    console.log(`  ${currency}: ${amount}`);
                }
            }

            const exchange = ExchangeFactory.getExchange(exchangeName as ExchangeName);
            if (exchange) {
                const value = await exchange.calculateTotalValueInUsdt(balance);
                totalSpot += value.spot;
                totalFutures += value.futures;

                console.log('\n USDT/USD 计价:');
                console.log(`  现货账户: ${value.spot.toFixed(2)}`);
                console.log(`  合约账户: ${value.futures.toFixed(2)}`);
                console.log(`  总计: ${(value.spot + value.futures).toFixed(2)}`);

                exchangeTotalMap.set(exchangeName, value.spot + value.futures);
            }
        }

        // 显示总价值
        console.log('\n总资产价值(USDT):');
        console.log(`  总计: ${(totalSpot + totalFutures).toFixed(2)}`);

        // 更新飞书表格
        updateTable(exchangeTotalMap);
    } catch (error) {
        console.error('程序运行出错:', error);
        process.exit(1);
    }
}

main().catch(console.error); 
