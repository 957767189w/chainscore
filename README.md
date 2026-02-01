# ChainScore Protocol

链上信誉评分协议 - 基于 GenLayer 构建

用户查询前需连接 MetaMask，支付 GEN 代币后获取 AI 分析的信用评分。

---

## 项目结构

```
chainscore/
├── app/                    # Next.js App Router
│   ├── layout.js           # 根布局
│   ├── page.js             # 主页面
│   └── globals.css         # 全局样式
├── components/             # React 组件
│   ├── Header.js           # 顶部导航
│   └── ScoreCard.js        # 评分卡片
├── lib/                    # 工具库
│   ├── genlayer.js         # GenLayer SDK 封装
│   ├── useWallet.js        # 钱包 Hook
│   └── useScore.js         # 评分查询 Hook
├── contracts/              # 智能合约
│   └── chain_score.py      # GenLayer 合约
├── public/                 # 静态资源
├── package.json
├── next.config.js
├── vercel.json             # Vercel 部署配置
└── .env.example            # 环境变量模板
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_GENLAYER_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0x你的合约地址
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 部署智能合约

### 方法一：GenLayer Studio（推荐）

1. 访问 https://studio.genlayer.com/
2. 创建新合约，粘贴 `contracts/chain_score.py` 内容
3. 点击 Deploy
4. 复制合约地址到 `.env.local`

### 方法二：GenLayer CLI

```bash
# 安装 CLI
npm install -g genlayer-cli

# 配置网络
genlayer network testnet

# 部署合约
genlayer deploy --contract contracts/chain_score.py
```

---

## 部署到 Vercel

### 方法一：GitHub 集成（推荐）

1. 将代码推送到 GitHub
2. 访问 https://vercel.com/new
3. 导入 GitHub 仓库
4. 添加环境变量：
   - `NEXT_PUBLIC_GENLAYER_NETWORK`: `testnet`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: `你的合约地址`
5. 点击 Deploy

### 方法二：Vercel CLI

```bash
# 安装 CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

---

## MetaMask 配置

用户首次使用时，需要添加 GenLayer 网络：

| 配置项 | Testnet Asimov |
|--------|----------------|
| 网络名称 | GenLayer Testnet |
| RPC URL | https://testnet-rpc.genlayer.com |
| Chain ID | 61998 |
| 货币符号 | GEN |
| 区块浏览器 | https://testnet-explorer.genlayer.com |

**应用会自动提示添加网络，用户只需确认即可。**

---

## 查询机制

当前版本**免费查询**（query_fee = 0）

流程：
1. 用户发起查询
2. MetaMask 弹出交易确认（gas费）
3. 用户确认交易
4. 合约执行 AI 分析
5. 返回评分结果

如需启用收费，修改合约中 `self.query_fee` 的值。

---

## 修改费用

当前为免费（`query_fee = 0`）。如需收费，修改合约：

```python
# 当前：免费
self.query_fee = 0

# 修改为 0.1 GEN
self.query_fee = 100000000000000000
```

同时修改前端 `lib/genlayer.js`：

```javascript
export const QUERY_FEE = BigInt('100000000000000000');
```

---

## 开发说明

### 本地开发（使用 Studio）

1. 启动 GenLayer Studio

```bash
genlayer init
genlayer up
```

2. 修改环境变量

```env
NEXT_PUBLIC_GENLAYER_NETWORK=studionet
```

3. 在 Studio 中部署合约

4. 启动前端

```bash
npm run dev
```

### 网络配置

| 网络 | RPC | Chain ID |
|------|-----|----------|
| studionet | http://localhost:4000/api | 61999 |
| testnet | https://testnet-rpc.genlayer.com | 61998 |

---

## 测试 GEN 代币

在 Testnet 上获取测试代币：

1. 加入 GenLayer Discord: https://discord.gg/genlayer
2. 在 #faucet 频道发送你的地址
3. 或访问官方 Faucet（如果有）

---

## 常见问题

### Q: MetaMask 没有弹出？

- 检查是否安装 MetaMask
- 检查浏览器是否阻止弹窗
- 尝试刷新页面

### Q: 提示「扣款失败」？

- 检查 GEN 余额是否充足（>= 0.1 GEN）
- 确认已切换到正确网络
- 检查合约地址是否正确

### Q: 评分很慢？

- GenLayer AI 共识需要多个验证器参与
- 首次查询通常需要 20-30 秒
- 缓存的评分会更快返回

### Q: 如何修改 UI？

- 样式文件: `app/globals.css`
- 主页面: `app/page.js`
- 评分卡片: `components/ScoreCard.js`

---

## 技术栈

- **前端**: Next.js 14, React 18
- **智能合约**: GenLayer (Python)
- **SDK**: genlayer-js
- **部署**: Vercel
- **钱包**: MetaMask

---

## 相关链接

- GenLayer 文档: https://docs.genlayer.com/
- GenLayer Studio: https://studio.genlayer.com/
- GenLayer JS SDK: https://docs.genlayer.com/api-references/genlayer-js
- Testnet Asimov: https://www.genlayer.com/testnet

---

## License

MIT
