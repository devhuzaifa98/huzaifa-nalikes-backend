import Web3 from "web3";

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + process.env.SIGNER_PRIVATE_KEY
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

export const rewardWinner = async (winnerAddress, amount) => {
  try {
    const amountInWei = web3.utils.toWei(amount, "ether");

    const gasEstimate = await web3.eth.estimateGas({
      to: winnerAddress,
      value: amountInWei,
    });
    const gasPrice = await web3.eth.getGasPrice();

    const tx = {
      to: winnerAddress,
      from: account.address,
      value: amountInWei,
      gas: gasEstimate,
      gasPrice: gasPrice,
    };
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      account.privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    return { transactionHash: receipt.transactionHash };
  } catch (err) {
    console.error("Error transferring Ether:", err);
  }
};
