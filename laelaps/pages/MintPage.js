import styles from "../styles/MintPage.module.css";
import { ConnectWallet } from "@thirdweb-dev/react";
import { useSwitchChain } from "@thirdweb-dev/react";
import { Ethereum } from "@thirdweb-dev/chains";
import { useNetworkMismatch } from "@thirdweb-dev/react";
import { ThirdwebSDK, getContract } from "@thirdweb-dev/sdk";
import { useAddress } from "@thirdweb-dev/react";
import contractAbi from "../contracts/MasterKey.json";
import { ethers, toNumber } from "ethers";
import CircularProgress from "@mui/material/CircularProgress";
import { useState, useEffect } from "react";

const contractAddress = "0x691c77F69a6AE05F5C8cC9f46d7E46Ce97FA2F3B";

function receipt(txnReceipt) {
  const txnHash = txnReceipt["TransactionHash"];
}

async function contractPriceGridValues() {
  const values = {};
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractInstance = new ethers.Contract(
    contractAddress,
    contractAbi,
    signer
  );
  const mintCost = await contractInstance.mintCost();
  const mintCostEth = ethers.utils.formatEther(mintCost.toNumber());
  values["Mint Cost"] = mintCostEth;
  const percentageBig = await contractInstance.percentage();
  const percentage = percentageBig.toNumber();
  values["Percentage"] = percentage + "%";
  console.log(values)
  return values;
}

export default function Utility() {
  const isMismatched = useNetworkMismatch();
  const userAddress = useAddress();
  const [loading, setLoading] = useState(false);
  const [contractVals, setContractVals] = useState({});
  const switchChain = useSwitchChain();

  useEffect(() => {
  async function fetchData() {
    try {
      if (isMismatched) {
        switchChain(Ethereum.chainId);
      }
      const values = await contractPriceGridValues();
      setContractVals(values);
      console.log(values);
    } catch (err) {
      alert("Error switching network");
    }
  }

  fetchData();
}, [isMismatched, switchChain]);

  async function mintNFT(event) {
    if (!isMismatched && userAddress) {
      console.log(userAddress);
      console.log(isMismatched);
      try {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );
        const txn = await contractInstance.mintNFT(userAddress, {
          value: ethers.utils.parseUnits(contractVals["Mint Cost"], "ether"),
        });
        const recepit = await txn.wait();

        console.log(recepit);
        alert(
          "Mint Successful! View your NFT on Opensea! Token address: ",
          contractAddress
        );
        setLoading(false);
      } catch (err) {
        alert("Error in Mint");
        setLoading(false);
      }
    } else if (!isMismatched && userAddress) {
      alert("Switch to correct network!");
    } else if (!isMismatched && !userAddress) {
      alert("Please connect wallet in order to mint");
    }
  }

  return (
    <div className={styles.square}>
      <ConnectWallet />
      <br />
      {loading ? (
        <div className={styles.loadingText}>MINTING....</div>
      ) : (
        <button onClick={mintNFT} className={styles.mintButton}>
          MINT YOURS HERE!
        </button>
      )}
      <br />
      <div className={styles.valuesContainer}>
        {Object.entries(contractVals).map(([key, value]) => (
          <div className={styles.box}>
            {key}: {value}
          </div>
        ))}
      </div>
      <br />
      <div className={styles.gif}>
        <img
          src="https://cloudflare-ipfs.com/ipfs/QmXT48ANVqBHMbCP9kYDtVezh6MqPLPKw95oETKKdxcdA6"
          className={styles.gifImage}
        />
      </div>
      <br />
      <div className={styles.title}>Mint Your Master Key</div>
      <br />

      <div className={styles.textMain}>
        Coming Soon! Every Master Key purchase will automatically trigger a
        purchase of $LAELAPS and immediately burn the purchased tokens.
      </div>
    </div>
  );
}
