import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [dailyLimit, setDailyLimit] = useState(undefined);
  const [newOwner, setNewOwner] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [owner, setOwner] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account.length > 0) {
      console.log("Account connected: ", account);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(ethers.utils.formatEther(balance)); // Convert balance to ether
      } catch (error) {
        console.error("Error getting balance:", error);
      }
    }
  };

  const getDailyLimit = async () => {
    if (atm) {
      try {
        const dailyLimit = await atm.dailyLimit();
        setDailyLimit(ethers.utils.formatEther(dailyLimit)); // Convert daily limit to ether
      } catch (error) {
        console.error("Error getting daily limit:", error);
      }
    }
  };

  const getOwner = async () => {
    if (atm) {
      try {
        const owner = await atm.owner();
        setOwner(owner);
      } catch (error) {
        console.error("Error getting owner:", error);
      }
    }
  };  

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.deposit({ value: ethers.utils.parseEther(depositAmount) });
        await tx.wait();
        setDepositAmount(""); // Clear the input field
        getBalance();
      } catch (error) {
        console.error("Error depositing:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        setWithdrawAmount(""); // Clear the input field
        getBalance();
      } catch (error) {
        console.error("Error withdrawing:", error);
      }
    }
  };

  const emergencyWithdraw = async () => {
    if (atm) {
      try {
        console.log("Initiating emergency withdrawal...");
        let tx = await atm.emergencyWithdraw();
        console.log("Transaction sent:", tx);
        await tx.wait();
        console.log("Transaction confirmed:", tx);
        getBalance();
      } catch (error) {
        console.error("Error in emergency withdrawal:", error);
      }
    } else {
      console.log("ATM contract not initialized");
    }
  };

  const transferOwnership = async () => {
    if (atm && newOwner) {
      try {
        let tx = await atm.transferOwnership(newOwner);
        await tx.wait();
        setNewOwner(""); 
        getOwner();
      } catch (error) {
        console.error("Error transferring ownership:", error);
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return (
        <div style={{ textAlign: "center" }}>
          <p>Please install Metamask in order to use this ATM.</p>
          <button onClick={connectAccount}>Connect Metamask Wallet</button>
        </div>
      );
    }

    if (!account) {
      return (
        <div style={{ textAlign: "center" }}>
          <button onClick={connectAccount}>Connect Metamask Wallet</button>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    if (dailyLimit === undefined) {
      getDailyLimit();
    }

    return (
      <div style={{ textAlign: "center" }}>
        <p>Contract Owner: {owner}</p>
        <p>Your Balance: {balance} ETH</p>
        <p>Daily Withdrawal Limit: {dailyLimit} ETH</p>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Amount to deposit (ETH)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            style={{ padding: "10px", marginRight: "10px", borderRadius: "4px" }}
          />
          <button onClick={deposit} style={{ padding: "10px 20px", borderRadius: "4px" }}>Deposit</button>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Amount to withdraw (ETH)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            style={{ padding: "10px", marginRight: "10px", borderRadius: "4px" }}
          />
          <button onClick={withdraw} style={{ padding: "10px 20px", borderRadius: "4px" }}>Withdraw</button>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <button onClick={emergencyWithdraw} style={{ padding: "10px 20px", borderRadius: "4px" }}>Emergency Withdraw All</button>
        </div>
        <div>
          <input
            type="text"
            placeholder="New Owner Address"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            style={{ padding: "10px", marginRight: "10px", borderRadius: "4px" }}
          />
          <button onClick={transferOwnership} style={{ padding: "10px 20px", borderRadius: "4px" }}>Transfer Ownership</button>
        </div>
        <p> Thank you for using this ATM!</p>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);
  
  useEffect(() => {
    if (atm) {
      getOwner(); // Fetch the owner when the ATM contract is initialized
    }
  }, [atm]);

  return (
    <main>
      <header style={{ textAlign: "center" }}><h1>The Expense Control ATM!</h1></header>
      {initUser()}
    </main>
  );
}
