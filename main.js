
const TAOO_MINT_ADDRESS = "9BMFqxjdL6eTaVxPREi4Whbi99qfjNTmJPZgSXqmpump";
const RECEIVER_ADDRESS = "JCA7AUfRKdyhwTmAYXYcDB3ZbjivGG1ezQ2fd33MYrwA";
const TAOO_AMOUNT = 1000;

let provider = null;

document.getElementById("connectWallet").addEventListener("click", async () => {
  if (window.okxwallet && window.okxwallet.solana) {
    provider = window.okxwallet.solana;
    try {
      await provider.connect();
      document.getElementById("payButton").disabled = false;
      alert("钱包连接成功: " + provider.publicKey.toString());
    } catch (err) {
      alert("连接失败: " + err.message);
    }
  } else {
    alert("未检测到 OKX Web3 钱包，请安装插件或使用 OKX App 打开网页");
  }
});

document.getElementById("payButton").addEventListener("click", async () => {
  if (!provider) return alert("请先连接钱包");

  const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));
  const fromPubkey = provider.publicKey;
  const mint = new solanaWeb3.PublicKey(TAOO_MINT_ADDRESS);
  const toPubkey = new solanaWeb3.PublicKey(RECEIVER_ADDRESS);

  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(fromPubkey, { mint });
    const userTokenAccount = tokenAccounts.value[0]?.pubkey;
    if (!userTokenAccount) return alert("你没有足够的 TAOO");

    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: 1 // 实际转账为 SPL Token, 这里只是示例
      })
    );
    transaction.feePayer = fromPubkey;
    let blockhash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;

    let signed = await provider.signTransaction(transaction);
    let txid = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(txid);

    document.getElementById("result").classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("支付失败: " + err.message);
  }
});
