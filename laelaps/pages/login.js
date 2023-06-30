import { useState, useEffect } from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/MintPage.module.css";
import { useSwitchChain } from "@thirdweb-dev/react";
import { useNetworkMismatch } from "@thirdweb-dev/react";
import { Ethereum } from "@thirdweb-dev/chains";
import { useAddress } from "@thirdweb-dev/react";
import { useRouter } from 'next/router';


export default function Utility() {
  const [link, setLink] = useState();
  const [balances, setBalances] = useState([]);
  const switchChain = useSwitchChain();
  const isMismatched = useNetworkMismatch();
  const userAddress = useAddress();
  const router = useRouter();


  useEffect(() => {
    (async () => {
      if (!isMismatched && userAddress) {
        const bot = router.query.bot
        const chatId = router.query.chatId
        const response = await fetch("/api/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userAddress, bot, chatId }),
        });
        const balances = await response.json();
        setBalances(balances)
      } else if (isMismatched && userAddress) {
        await switchChain(Ethereum.chainId);
      }
    })();
  }, [isMismatched, switchChain, userAddress]);

  return (
    <div className={styles.square}>
      <ConnectWallet />
      <br/>
      <div className={styles.valuesContainer}>
        <div className={styles.box}>Laelaps Balance: {balances["laelaps"]} Eth</div>
        <div className={styles.box}>
          Master Key Balance: {balances["masterKey"]}
        </div>
      </div>
      {link}
    </div>
  );
}