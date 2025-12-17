const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ================= 配置开始 =================

// 1. Base 链上的代币合约地址（必填）
// 替换为您想要转账的具体代币地址
// 示例：Base 上的 USDC 地址是 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "0x_YOUR_TOKEN_ADDRESS_HERE";

// 2. 接收地址文件（必填）
// 包含接收地址的文件（每行一个）
const RECIPIENTS_FILE = "recipients.txt";

// 3. Base 链的 RPC URL
const RPC_URL = process.env.RPC_URL || "https://mainnet.base.org";

// 4. 包含私钥的文件（每行一个）
const KEYS_FILE = "private_keys.txt";

// ================= 配置结束 ===================

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function main() {
  console.log("开始批量转账脚本...");

  // 1. 验证配置
  if (TOKEN_ADDRESS.includes("YOUR_TOKEN_ADDRESS")) {
    console.error("❌ 错误：请在脚本中设置 TOKEN_ADDRESS。");
    process.exit(1);
  }

  // 2. 初始化提供者
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  try {
    const network = await provider.getNetwork();
    console.log(`✅ 已连接到网络: ${network.name} (链 ID: ${network.chainId})`);
  } catch (error) {
    console.error("❌ 连接 RPC 时出错:", error.message);
    process.exit(1);
  }

  // 3. 读取私钥
  const keysFilePath = path.join(__dirname, KEYS_FILE);
  if (!fs.existsSync(keysFilePath)) {
    console.error(`❌ 错误：未在 ${keysFilePath} 找到私钥文件`);
    process.exit(1);
  }

  const privateKeysRaw = fs.readFileSync(keysFilePath, "utf-8");
  const privateKeys = privateKeysRaw
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));

  if (privateKeys.length === 0) {
    console.error("❌ 错误：文件中未找到私钥。");
    process.exit(1);
  }

  // 4. 读取接收地址
  // const recipientsFilePath = path.join(__dirname, RECIPIENTS_FILE);
  // if (!fs.existsSync(recipientsFilePath)) {
  //   console.error(`❌ 错误：未在 ${recipientsFilePath} 找到接收地址文件`);
  //   process.exit(1);
  // }

  // const recipientsRaw = fs.readFileSync(recipientsFilePath, "utf-8");
  // const recipients = recipientsRaw
  //   .split("\n")
  //   .map(line => line.trim())
  //   .filter(line => line && !line.startsWith("#"));

  // if (recipients.length === 0) {
  //   console.error("❌ 错误：文件中未找到接收地址。");
  //   process.exit(1);
  // }

  // // 验证接收地址数量是否足够对应私钥数量
  // if (recipients.length < privateKeys.length) {
  //   console.warn(`⚠️ 警告：找到 ${privateKeys.length} 个私钥，但只有 ${recipients.length} 个接收地址。`);
  //   console.warn(`⚠️ 最后 ${privateKeys.length - recipients.length} 个钱包将被跳过。`);
  // }
  const recipients = [
    "0x33de719f7571e90826b573b70d29193021a04917",
    "0x9755d313e4afc327bce8565fd2f084d699416d82",
    "0x7a6ca9a4d39d526e5167ccac3edba24cfeb69cc7",
    "0x102b85e7de3dfdfef0ba7be7c208b9f5066a8e13",
    "0xd8133a5025e7531d9e66d44f74e667fd6caa5dbe",
    "0x8a20955ec659d5c49c590298526b5bf37b5445e2",
    "0x63c87d7396efdcf687b1ce7b8687b0eb0b7c64af",
    "0x5d22743be9f719cb36d2541fd682dd5c986055f1",
    "0xa48ac22424cdeb70a9f9d5a38eb02c546d81eb52",
    "0x5a2eaea21decd18a5d82610d2ffa310a304aa5ad",
    "0x55504774cd7168d45d0beeed404c7d6ffd9aeb83",
    "0x27ba2072f47a5492a5e4b87b956bd26ae5ab68b3",
    "0xb6c251fc045c9b06e0c5e9b80e399a9b92814756",
    "0x721435be5121702394e9e912b493e1229b9e946c",
    "0x30890cf750fb888020b826dd4501ec2444bee731",
    "0xd50a1575e8aaad56e999042923aeeac152fff910",
    "0x302ed3a6079572ae149ef3500d1a9e909eadbdc1",
    "0xd5874f111c6cad5af26c5549159d8e092c1e5370",
    "0x86dfa1e2fe5b1058b6e565acad47240df4802e2b",
    "0xf28db289bf286184695d124fee440038a3747230",
    "0x1ccbcce4c33baed0f38de869307f26472ccee51c",
    "0xb02b6031daaf706515092ec032989619d9d543a4",
    "0xfc225868cc468337b7eb006414512027ef23a365",
    "0xe307525678bac6bbbb77a72bcd68db487e55677f",
    "0x5fd1a4dbb556535d4c489ee19aef314a63d7f0f7",
    "0x3805f496b8c53b4f496e86ef30794cba2d3b4625",
    "0x0e25dd785c68cdc8b885e6a66a8568b13be3ad2c",
    "0x53590a0079e303d0d86ea145df2ce997ecd17bf7",
    "0x70d3aea0cca5508a60df6224be657f17ae2273b0",
    "0xfa448923d32e75fb025ac6c463f55818f676aa15",
    "0xe6af8d67604ed185f1b055f054952bf02cf8c9c4",
    "0xa87df4679ef00cc03f6f1ac299cea6917a852685",
    "0x9f9e3554d7b7cd5f1b6806e864313a773e9a08d1",
    "0x9c4e3fb79a84fa5026e6932401df4c494d700171",
    "0x48606d51129236f8445d01ad6141eaae47ef011f",
    "0xd4e9fb0096d4442e102f76923ede472c8197b3e3",
    "0x2b3d18ce97950f08e5e7c97ad7119b62edef071d",
    "0xeeccf7a9e85171a259c000395a2bd0cf5a9de0bd",
    "0xa84f4f0d960089fdf7c13f31940ec56b3d57c0f5",
    "0x2393031ace6ebbf47a495a853d50362eac871f32",
    "0x0c4ba92b9ccc3b43aba200df5f6d4b7ce32896b3",
    "0x5ac5ecec6a193775a48992a3e5153403a8e01533",
    "0x42ac9a69476ee6d733286f4fe44d73d4d9c39cc2",
    "0xc4d3446832fef16b3b1bb7da36660a4f9b313e75",
    "0xc79ce45d761c310198b43d75afc92e5018007c51",
    "0xea575c5547c52c8042a7263dd137bb55d7877e91",
    "0x2f103399c7b45605d71992cccbf182e1efad370b",
    "0xf5b904957975dd0af9bb1263dbad651f57a19aa7",
    "0x9356f9236ed8c24b3afe2f4067304f68a4272869",
    "0x2965b716b987903ea6727bdef5fd6677dec7f530",
    "0xb07f1b170338bbf1517a425595148b8c64538690",
    "0xbbfab97c6d3d7eeede351acf06c9ebe8ce99c2f4",
    "0x253d58faf4b201a09e569646b36b3ff928163775",
    "0xee44fee888382f3e6f7895cb2a542630289f41d7",
    "0x99837b75a651e1874c54dc72517ba571900585f3",
    "0xc0141e0b81933c5c804a7e809e2791af8872b361",
    "0x6ef27b997f3057de882dfc503721455ae9abf223",
    "0xd97cbcab0e5f40974b5aec9bb75c3298c4bd23a3",
    "0x786b3ce7d3217bbdbbf19f66ae5b6e4644790ba1",
    "0x0751e864a7abc8f171aebe9fb76db46a8038b94e",
    "0x86fec74d5281806e6d5163c646ffaadda2569f45",
    "0xc009c4bac907d0913c6625cbbb3b3eb84c11fa7d",
    "0x7a471f60ddd0c86dfa9ddb6969bb8132fbf87887",
    "0x1e3c8c6659563f094378daefd5f01e23652dd392",
    "0x272ef153f1308fb5c8f2bcf02602d5a0d9e172a1",
    "0x6eadb703c532fe0dac93bf4a38e65af4d32388c7",
    "0x45bb2d2107ae97f8aef15ff79d3e1fc8b374cdb8",
    "0xd682b0590be350fb1494896240335c9d46be5977",
    "0x0ab1f88b81f5360ab2e9b5ddf79d34c21c11f25c",
    "0xfe72c48cd2683d43a077660d0e91fffcd2db5631",
    "0x8a5605892ad2ec275627ae4bb09af68518096d58",
    "0x7131cf480cd4b9b2d1637d8b15fbab469467de11",
    "0x5b7c868b33e99565eb722460143743330c5879de",
    "0x0f5357855eab43135368c2fe9dcf16d9174d2451",
    "0xc66d6e2d4c5af8159f2daf730e111bdbe9f5dc7c",
    "0x7f5bdd1715d716dd67996f249b3ddc332692717f",
    "0x6cb7dd84aedf5f8b01a1a880b0ec99b923b3725b",
    "0x796cdcdaadaca8aa134db9e4e588831845ec66f2",
    "0xba3b4e00adbce324f5edf8baef616ec5edad9bc7",
    "0x4427d6625d29cddff74384cea468212ccb08952d",
    "0xbe6fafe15b922f9a124195b5cdbd5b9c68b1bdc0",
    "0xd80fe04f32301a0430ae00a47bb5849f1dbbaf3e",
    "0x3f357587590dbcd24af3e4da21aef6e23ee97411",
    "0x7485dc8db4491f9f1c8fd1fe1049f16b611f6bf6",
    "0xb757070f1c0e2ff8edd04eb6dc12588a6e1d9c6a",
    "0x6faa06c0b7b74a039d4486d05adf0148ebe2a3a9",
    "0x52a316896d61c571819ef241f5ae65c3ef399d13",
    "0xad733eeece67f38f5c4581aa82952509858d9547",
    "0x24dd1d53cf2492fbdcfc372cf5a3cf9308ee4e6a",
    "0xbc3b48dc148efd3c5ebd85cdacac4bf272782154",
    "0xbe3924af74dad4b722547525a9694c41cdbf396f",
    "0xd688a7727b7e5a0f6f5460f03fde01e197b44ec1",
    "0xd6e711c67fab86d08809d4c77ae95f6c4870a492",
    "0x00d0ad7ff19cec36192b5b50bcace9f3274d79ad",
    "0xe8d26eb206ce287acb479875e14186bfe2034d25",
    "0x1b42f76e2026dd026e5e5990262bffe439e51c45",
    "0x9f09c9dea5460c5979e3a9c05c05acacccf2fb58",
    "0x963a3b609b44281e49e29a4f53fa3b2d74edc3dc",
    "0x60a3bd96276d4eb489eb1436464f75e574926b25",
    "0xf694405a7ff6ad40e69ace6265e586308eaf60c7",
    "0xcae58e3b8bebb67633a3b298856e4dcc03bff5cc",
    "0x09b4b761f5f521a14e3b984c894bb0d0cb3bb5ac",
    "0x56a3334fa5a86f00828230e6db355af84c9871d7",
    "0xb82151b6ec9b2bf3649bb2dc0d36fed21975ba5f",
    "0x91b9474d7a366e1542dbcb0375b30719644f5d06",
    "0x400c57cfcf1e111d2593d242f6a5c58d49311889",
    "0x3f572f9092c95cfc9aa965efc483fb41209a0b1f",
    "0x4ce73493379f6458586d8e9274bbf6ab81cdb684",
    "0xfb7402c9f07fc4697f79435032e965bfc6baa7c1",
    "0xfc5d21f20d98aa739902d3aef8695d5ff313d669",
    "0x6e7b2308fcd1dcb187a407a86b97424389134f99",
    "0x9a72117656e89e4a692225276309f9be1591f131",
    "0xd5ab0aa5076a2d362611b33887673ff9e67f91ef",
    "0xa05faf8ef704ddc7aec964b58c4410ff13b56753",
    "0x694efb4a9188ad2c2fd8a1cf120cde1ce106a653",
    "0x6d56765ff1eae7a2e3783259bb40c8e986625d5b",
    "0x35cc6e731d58574937930e8197d1b82fac87ff41",
    "0x5c52294d55460fccd5179b6d16419261c6960e16",
    "0x5549b4c7756e3a82660564857641c62afb293d5b",
    "0x34c32e5f9beae42685b7809b75659014adfe76d2",
    "0xc132efd6ba5c1b9e720803f7176fd406913bfc88",
    "0x0dd45c342ffe3e04a3e91f2ddd8421580ced6dc8",
    "0xb0af96e0b82e354101d5f00bacfc88b98fdda7c1",
    "0x2838173be197a9621b60ba0a8879564d443f4287",
    "0xb4687f260922b41363714f63a32d6239f902d793",
    "0x90f1b11b1f66f5d39658a0da298fd94bdc201af5",
    "0xd39d9012bb90aef55842496d9f922e459cc3d05f",
    "0xf86071e738c5c9a64b66f4316128d0a585cefc88",
    "0x07604799fe9c766d7236da2cc9181295d246fa81",
    "0x2ea77daafb80373d741a770ac82d175859073435",
    "0x0415872bada13cc8e2cb5015d275a672fde6a9d0",
    "0x5c00c54889f547002bb91e2b8a52b7527e238a55",
    "0xa8772cba74bc36689aa2123ba6742df9ff7faf11",
    "0x912aafe957db177e11494a69b9d20bab119e67c7",
    "0xc47277af05dfb8360f0890c1052025df2ff24e43",
    "0x64345c680bff9663d7291040f48e092e59101fe1",
    "0x550dd276330c541a548e32eed0ad7006191329fa",
    "0x5f2e1908bf119ee2c4a5b620a24595bf7cdc29db",
    "0xd46dbac409a52e363bcadf605801ecad02843fa3",
    "0x05bdf723c26d5e7a66d03512b75ae228d4d819f0",
    "0x472b0153875bbc7c2050f1c795302e56ebdde991",
    "0x82b77a558a847e6002bda80e9dbd4929136fdac0",
    "0x0ce58118d44fa2672f58965d6ddb5701cbac39a1",
    "0x9f2314eab93b0da341a93a92cc74b7c79be62f59",
    "0xfc90782baf54e3606722279ce21bc09953b42905",
    "0x844e40a505f99fc9af0164e20d50e31e3e5a9edf",
    "0x35c1fafab86bb0b2b5266f63fffa90cbb12cee63",
    "0xc7e481f593bf75d48ade61e56ae99a3850cde624",
    "0x99664e9d6db51aa86a2e150d46f9b7e17e22eacc",
    "0x40a88165262b7b903e349a5208514e0c9e24ae78",
    "0x8136c5b0925004d56b07abedc0f596ad8ae4b634",
    "0x5cefccecf81d4a273806094597d2bbbce274c8fb",
    "0x2cdef0cc97a24093d650dfdc614628c112fe5c14",
    "0x81f4b750a1311e7f91e765167cf15f9c0ad6b9ff",
    "0x70876304dccd5e1848973290f2039369aed79a6e",
    "0x402b0cb27024ca5dbaf98b78b514d21a11447f00",
    "0x0f4b8d0e4a547cd72fd182633955de4ce86b9e5c",
    "0xe292ec73a823bed08d0cf9678708e88ebce5021d",
    "0x0fdac86ab671be25fbc95d81c7b0c400b79d363c",
    "0xb8fe58c8c8e748fd932c7cb9f8a07ff76f4506b7",
    "0xb3c46b5d59ad994040eb6f642ba5ab8536191fbf",
    "0x411b881d16fb1fdbdd519d48fd6ef224587ccfec",
    "0x88e13a84a1356aaf8f990bcdbada6eb8d9a2907b",
    "0x7ac6f7463752d2b004aef2ac2de93669c777a373",
    "0xb99de262642a9c210909882b74cd4881adecdd65",
    "0x76a045999a3ee157744dc6c5a0617fced43676b3",
    "0x710c00b7d5350f79830b51ac0ece7ab3775a042b",
    "0xc38af965b16a9f129cf1e31f6ade9e161a353399",
    "0xc286646455ffc9de2fa080e49a96e3fbb536f4fa",
    "0x871e53c263c5b9cf0827b1e54784cdca1721d819",
    "0x81c7ab410dff034806561100ac526bbac34ad57e",
    "0x1423f78e9e836afaa773e17802f795a08ec9aef2",
    "0xda10372524edd10a81497a7626495b394d2c9b47",
    "0xf178cc377c08b0efcea29fbbcb07eee72be38c2b",
    "0x8a6be91f791ab0f2f388ccf059031d93dc10a6a1",
    "0x1590100162dc8b8f10feff1b3f2740f0be85adbd",
    "0x8e869320aca07aa699a282af6c1c04968195f62b",
    "0x0777f4d6e62f4fa68691d8d2557e552cc4893179",
    "0xe68aa9b2dd468108310a4c9f5ee415cff40dbcca",
    "0x668cda96a6edf3a65ace2b01e309e39cc50c72c9",
    "0xc410cdb18cf7af110fc7e3a8fb37b8051350910e",
    "0x0b66c1b38b5ae7b4741f1f14d52258bd6e8f9922",
    "0x32da7d7ead71e55117a54845d915c30546e1bda0",
    "0xde8362c6f6740e322ea2a8e834f51774d75c565f",
    "0xc9e9fa85c6d93271cfbcb022e057d95468d5db96",
    "0x5a855ab128e343edefdd62863a54d176b3648710",
    "0xd1d313e8585b256be424d040a301c34cd8d2fe67",
    "0x57a98ca80211bb0b16f1b3b6b589d17948937bc0",
    "0x123dd964236cd21a69a94f16cd82d1fc117da36a",
    "0x50a75cb92fe37339fa2fa7ec8dab75d9c0a961a9",
    "0xde8c23646a35ef112374df74d3ae0f9f805c2df6",
    "0x67a711803a226ceb8e326d20b20d1d542c3e843e",
    "0x06280726290a94baa256766d9733f9580bcc8a7e",
    "0xaaf06340bd7c6b0bb008029958ae054c10017fd7",
    "0xf42ad03e581e723236d7f5fbbdb921622eb5ce4e",
    "0x4d2c819a2ffeec6000640e234ad6fd794460b3db",
    "0x6386497069000d90065dc6ae653e0a58433eb184",
    "0x2f9709cc9719654a11055d90d327689ec26e295b",
    "0xc56bab64cf1946e205faa09c5876fb1f0d964c77",
    "0x4d64a8c0225683ca1e3f647f8b25948c53318650"
  ]


  console.log(`ℹ️ 找到 ${privateKeys.length} 个钱包和 ${recipients.length} 个接收地址。`);

  // 5. 处理转账
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
  let tokenSymbol = "TOKEN";
  let tokenDecimals = 18;

  try {
    tokenSymbol = await tokenContract.symbol();
    tokenDecimals = await tokenContract.decimals();
    console.log(`ℹ️ 代币详情: ${tokenSymbol} (精度: ${tokenDecimals}) 地址: ${TOKEN_ADDRESS}`);
  } catch (error) {
    console.error("⚠️ 警告：无法获取代币详情。请验证地址。");
  }

  for (let i = 0; i < privateKeys.length; i++) {
    const pk = privateKeys[i];

    // 检查该钱包是否有对应的接收地址
    if (i >= recipients.length) {
      console.error(`\n❌ 错误：未找到索引为 ${i} 的钱包的接收地址。停止/跳过。`);
      continue;
    }

    const recipientAddress = recipients[i];

    try {
      if (!ethers.isAddress(recipientAddress)) {
        console.error(`\n❌ 索引 ${i} 处的接收地址无效: ${recipientAddress}。跳过。`);
        continue;
      }

      const wallet = new ethers.Wallet(pk, provider);
      console.log(`\n--- 正在处理钱包 ${i + 1}/${privateKeys.length}: ${wallet.address} -> ${recipientAddress} ---`);

      // 检查原生 ETH 余额（用于 Gas 费）
      const ethBalance = await provider.getBalance(wallet.address);
      if (ethBalance === 0n) {
        console.log(`⚠️ ETH 余额不足以支付 Gas。跳过。`);
        continue;
      }

      // 检查代币余额
      const balance = await tokenContract.balanceOf(wallet.address);
      const formattedBalance = ethers.formatUnits(balance, tokenDecimals);

      if (balance === 0n) {
        console.log(`ℹ️ 没有 ${tokenSymbol} 余额可转账。`);
        continue;
      }

      console.log(`💰 余额: ${formattedBalance} ${tokenSymbol}`);
      console.log(`🚀 正在将所有 ${formattedBalance} ${tokenSymbol} 转账给 ${recipientAddress}...`);

      // 连接钱包到合约
      const tokenWithSigner = tokenContract.connect(wallet);

      // 发送交易
      const tx = await tokenWithSigner.transfer(recipientAddress, balance);
      console.log(`⏳ 交易已发送！哈希: ${tx.hash}`);

      // 等待确认
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        console.log(`✅ 转账在区块 ${receipt.blockNumber} 中已确认`);
      } else {
        console.error(`❌ 交易失败！`);
      }

    } catch (error) {
      console.error(`❌ 处理钱包时出错:`, error.message);
    }
  }

  console.log("\n✅ 批量转账过程已完成。");
}

main().catch(console.error);
