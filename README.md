<!--
 * @Author: xahy123 2985450893@qq.com
 * @Date: 2025-12-17 02:55:09
 * @LastEditors: xahy123 2985450893@qq.com
 * @LastEditTime: 2025-12-17 02:58:08
 * @FilePath: /tranf/README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# Base 链批量代币转账脚本

这是一个使用 Node.js 开发的脚本，用于从多个钱包地址批量将指定的 ERC20 代币（Base 链）全部转账到指定的接收地址（支持一对一转账）。

## 功能特点

*   **批量处理**：自动读取 `private_keys.txt` 中的所有私钥。
*   **一对一转账**：支持每个私钥对应一个独立的接收地址（通过 `recipients.txt` 配置）。
*   **自动全额**：自动检测每个钱包的代币余额，并全部转出。
*   **Base 链支持**：默认配置为 Base Mainnet。
*   **Gas 检查**：自动跳过没有 ETH (Gas) 的钱包，避免报错。

## 环境准备

确保你的电脑上已安装 [Node.js](https://nodejs.org/) (建议版本 v16+)。

## 安装步骤

1.  **安装依赖**
    在当前目录下打开终端，运行以下命令安装所需库：
    ```bash
    npm install
    ```

## 配置说明

### 1. 设置私钥
打开项目根目录下的 `private_keys.txt` 文件，填入要转出代币的钱包私钥，**每行一个**。
```text
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```
*(注意：请妥善保管私钥文件，不要上传到公共代码库)*

### 2. 设置接收地址
打开项目根目录下的 `recipients.txt` 文件，填入接收代币的钱包地址，**每行一个**。
脚本会根据行号索引进行匹配：第 1 个私钥转给第 1 个地址，第 2 个私钥转给第 2 个地址，以此类推。
```text
0xRecipientAddress1...
0xRecipientAddress2...
...
```

### 3. 配置代币地址
打开 `transfer.js` 文件，修改顶部的配置区域：

```javascript
// ================= CONFIGURATION START =================

// 1. 代币合约地址 (必填)
// 例如：Base 链上的 USDC 地址
const TOKEN_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // <--- 在这里修改

// ...
```

## 运行脚本

配置完成后，在终端运行：

```bash
node transfer.js
```

脚本将开始执行，并在控制台输出每个钱包的处理进度和交易哈希。

## 常见问题

*   **Insufficient ETH for gas**: 钱包中缺少 Base 链的原生代币 (ETH) 用于支付矿工费，请先充值少量 ETH。
*   **Error connecting to RPC**: 网络连接问题，请检查网络或更换 `RPC_URL`。
