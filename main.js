import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from "https://cdn.jsdelivr.net/npm/@solana/web3.js@1.73.2/+esm";

import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from "https://cdn.jsdelivr.net/npm/@solana/spl-token@0.3.9/+esm";

import WalletConnectProvider from "https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.8.0/dist/esm/index.js";

// === 配置 ===
const TAOO_MINT = new PublicKey("9BMFqxjdL6eTaVxPREi4Whbi99qfjNTmJPZgSXqmpump");
const RECEIVER_WALLET = new PublicKey("JCA7AUfRKdyhwTmAYXYcDB3ZbjivGG1ezQ2fd33MYrwA");
const TAOO_AMOUNT = 1000; // 可手动修改

let walletAddress;
const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

document.getElementById("connectWallet").addEventListener("click", async () => {
  try {
    const provider = new WalletConnectProvider({
      rpc: { 1: "https://api.mainnet-beta.solana.com" },
      chainId: 1
    });

    await provider.enable();

    walletAddress = new PublicKey(provider.accounts[0]);
    alert("钱包连接成功：" + walletAddress.toBase58());
    document.getElementById("payButton").disabled = false;

    window.walletConnectProvider = provider;
  } catch (e) {
    alert("连接失败：" + e.message);
  }
});

document.getElementById("payButton").addEventListener("click", async () => {
  try {
    const fromATA = await getAssociatedTokenAddress(TAOO_MINT, walletAddress);
    const toATA = await getAssociatedTokenAddress(TAOO_MINT, RECEIVER_WALLET);

    const ix = createTransferInstruction(
      fromATA,
      toATA,
      walletAddress,
      TAOO_AMOUNT,
      [],
      TOKEN_PROGRAM_ID
    );

    const tx = new Transaction().add(ix);
    tx.feePayer = walletAddress;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    const signedTx = await window.walletConnectProvider.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(sig, "confirmed");

    document.getElementById("result").classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("支付失败：" + err.message);
  }
});
