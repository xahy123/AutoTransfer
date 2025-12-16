const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ================= CONFIGURATION START =================

// 1. Token Contract Address on Base Chain (Required)
// Replace with the specific token address you want to transfer
// Example: USDC on Base is 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "0x_YOUR_TOKEN_ADDRESS_HERE";

// 2. Recipient Addresses File (Required)
// The file containing recipient addresses (one per line)
const RECIPIENTS_FILE = "recipients.txt";

// 3. RPC URL for Base Chain
const RPC_URL = process.env.RPC_URL || "https://mainnet.base.org";

// 4. File containing private keys (one per line)
const KEYS_FILE = "private_keys.txt";

// ================= CONFIGURATION END ===================

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

async function main() {
    console.log("Starting batch transfer script...");

    // 1. Validate Configuration
    if (TOKEN_ADDRESS.includes("YOUR_TOKEN_ADDRESS")) {
        console.error("❌ Error: Please set the TOKEN_ADDRESS in the script.");
        process.exit(1);
    }

    // 2. Initialize Provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    try {
        const network = await provider.getNetwork();
        console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    } catch (error) {
        console.error("❌ Error connecting to RPC:", error.message);
        process.exit(1);
    }

    // 3. Read Private Keys
    const keysFilePath = path.join(__dirname, KEYS_FILE);
    if (!fs.existsSync(keysFilePath)) {
        console.error(`❌ Error: Private keys file not found at ${keysFilePath}`);
        process.exit(1);
    }

    const privateKeysRaw = fs.readFileSync(keysFilePath, "utf-8");
    const privateKeys = privateKeysRaw
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"));

    if (privateKeys.length === 0) {
        console.error("❌ Error: No private keys found in the file.");
        process.exit(1);
    }

    // 4. Read Recipient Addresses
    const recipientsFilePath = path.join(__dirname, RECIPIENTS_FILE);
    if (!fs.existsSync(recipientsFilePath)) {
        console.error(`❌ Error: Recipients file not found at ${recipientsFilePath}`);
        process.exit(1);
    }

    const recipientsRaw = fs.readFileSync(recipientsFilePath, "utf-8");
    const recipients = recipientsRaw
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"));

    if (recipients.length === 0) {
        console.error("❌ Error: No recipient addresses found in the file.");
        process.exit(1);
    }

    // Validate that we have enough recipient addresses for the private keys
    if (recipients.length < privateKeys.length) {
        console.warn(`⚠️ Warning: Found ${privateKeys.length} keys but only ${recipients.length} recipient addresses.`);
        console.warn(`⚠️ The last ${privateKeys.length - recipients.length} wallets will be skipped.`);
    }

    console.log(`ℹ️ Found ${privateKeys.length} wallets and ${recipients.length} recipient addresses.`);
    
    // 5. Process Transfers
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    let tokenSymbol = "TOKEN";
    let tokenDecimals = 18;

    try {
        tokenSymbol = await tokenContract.symbol();
        tokenDecimals = await tokenContract.decimals();
        console.log(`ℹ️ Token Details: ${tokenSymbol} (Decimals: ${tokenDecimals}) at ${TOKEN_ADDRESS}`);
    } catch (error) {
        console.error("⚠️ Warning: Could not fetch token details. Verify the address.");
    }

    for (let i = 0; i < privateKeys.length; i++) {
        const pk = privateKeys[i];
        
        // Check if we have a recipient for this wallet
        if (i >= recipients.length) {
            console.error(`\n❌ Error: No recipient address found for wallet index ${i}. Stopping/Skipping.`);
            continue;
        }

        const recipientAddress = recipients[i];
        
        try {
            if (!ethers.isAddress(recipientAddress)) {
                console.error(`\n❌ Invalid recipient address at index ${i}: ${recipientAddress}. Skipping.`);
                continue;
            }

            const wallet = new ethers.Wallet(pk, provider);
            console.log(`\n--- Processing Wallet ${i + 1}/${privateKeys.length}: ${wallet.address} -> ${recipientAddress} ---`);

            // Check Native ETH Balance (for Gas)
            const ethBalance = await provider.getBalance(wallet.address);
            if (ethBalance === 0n) {
                console.log(`⚠️ Insufficient ETH for gas. Skipping.`);
                continue;
            }

            // Check Token Balance
            const balance = await tokenContract.balanceOf(wallet.address);
            const formattedBalance = ethers.formatUnits(balance, tokenDecimals);

            if (balance === 0n) {
                console.log(`ℹ️ No ${tokenSymbol} balance to transfer.`);
                continue;
            }

            console.log(`💰 Balance: ${formattedBalance} ${tokenSymbol}`);
            console.log(`🚀 Transferring all ${formattedBalance} ${tokenSymbol} to ${recipientAddress}...`);

            // Connect wallet to contract
            const tokenWithSigner = tokenContract.connect(wallet);

            // Send Transaction
            const tx = await tokenWithSigner.transfer(recipientAddress, balance);
            console.log(`⏳ Transaction sent! Hash: ${tx.hash}`);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                console.log(`✅ Transfer confirmed in block ${receipt.blockNumber}`);
            } else {
                console.error(`❌ Transaction failed!`);
            }

        } catch (error) {
            console.error(`❌ Error processing wallet:`, error.message);
        }
    }

    console.log("\n✅ Batch transfer process completed.");
}

main().catch(console.error);
