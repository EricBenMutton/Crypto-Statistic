import { checkAllExchangesBalance } from './services/balanceService';
import { loadConfig } from './config';
import { ExchangeFactory } from './exchanges/factory';
import { ExchangeName } from './types/config';

// 加载配置并初始化交易所
const config = loadConfig();
Object.entries(config).forEach(([name, credentials]) => {
    ExchangeFactory.createExchange(name as ExchangeName, credentials);
    console.log(`已配置 ${name.toUpperCase()} 交易所`);
});

checkAllExchangesBalance().catch(console.error);