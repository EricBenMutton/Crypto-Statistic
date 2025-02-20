# 加密货币交易所余额监控工具

## 功能实现

本工具基于 CCXT 库开发，实现了以下功能：
- 支持同时查询多个交易所（Binance、Gate.io、Kraken）的账户余额
- 统一接口获取各交易所的资产信息
- 自动汇总显示账户总资产情况
- 支持现货和期货账户余额查询
- 实时获取最新市场价格，计算资产的美元价值

## API 配置

1. 在项目根目录创建 `.env` 文件
2. 在 `.env` 文件中配置以下 API 密钥：

```env
# 交易所 API 配置
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret

GATEIO_API_KEY=your_gateio_api_key
GATEIO_API_SECRET=your_gateio_api_secret

# Kraken 现货账户
KRAKEN_API_KEY=your_kraken_api_key
KRAKEN_API_SECRET=your_kraken_api_secret

# Kraken 期货账户
KRAKEN_FEATURE_API_KEY=your_kraken_feature_api_key
KRAKEN_FEATURE_API_SECRET=your_kraken_feature_api_secret
```

## 运行方法

1. 安装依赖：

```bash
npm install
# 或
yarn install
```

2. 运行程序：

```bash
# 开发环境运行
npm run dev
# 或
yarn dev

# 生产环境运行
npm run start
# 或
yarn start
```

运行后，程序会自动：
1. 连接配置的交易所
2. 获取账户余额信息
3. 计算各币种的美元价值
4. 显示汇总后的资产信息

## Web 服务

除了命令行运行外，还可以通过 Web API 触发余额检查：

### 启动 Web 服务
```bash
npm run server
# 或
yarn server
```

### API 接口

触发余额检查：
```
GET http://localhost:3000/balance
```

服务器将执行余额检查并更新飞书表格。
