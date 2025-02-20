import express from 'express';
import { loadConfig } from './config';
import { ExchangeFactory } from './exchanges/factory';
import { ExchangeName } from './types/config';
import { BalanceHandler } from './handlers/balance';
import { ApiResponse } from './types/api';

// 加载配置并初始化交易所
const config = loadConfig();
Object.entries(config).forEach(([name, credentials]) => {
    ExchangeFactory.createExchange(name as ExchangeName, credentials);
    console.log(`已配置 ${name.toUpperCase()} 交易所`);
});

const app = express();
const port = process.env.PORT || 3000;

// 路由配置
app.get('/balance', BalanceHandler.check);

// 错误处理中间件
app.use((err: Error, _req: express.Request, res: express.Response<ApiResponse>, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

