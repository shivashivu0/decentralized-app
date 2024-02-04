import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [ownerInfo, setOwnerInfo] = useState(undefined);
  const [minDeposit, setMinDeposit] = useState(1); // Default minimum deposit
  const [minWithdrawal, setMinWithdrawal] = useState(1); // Default minimum withdrawal
  const [depositAmount, setDepositAmount] = useState(""); // User input for deposit amount
  const [withdrawalAmount, setWithdrawalAmount] = useState(""); // User input for withdrawal amount
  const [error, setError] = useState(""); // Error message state

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
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
    handleAccount(accounts[0]);

    // once wallet is set we can get a reference to our deployed contract
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
      const balanceWei = await atm.getBalance();
      setBalance(parseInt(ethers.utils.formatEther(balanceWei))); // Convert balance to integer
    }
  };

  const deposit = async () => {
    if (atm) {
      if (depositAmount.trim() === "") {
        setError("Please enter a deposit amount");
        return;
      }
      if (parseFloat(depositAmount) < minDeposit) {
        setError(`Deposit amount should be at least ${minDeposit} ETH`);
        return;
      }
      setError(""); // Clear any previous errors
      let tx = await atm.deposit(ethers.utils.parseEther(depositAmount));
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      if (withdrawalAmount.trim() === "") {
        setError("Please enter a withdrawal amount");
        return;
      }
      if (parseFloat(withdrawalAmount) < minWithdrawal) {
        setError(`Withdrawal amount should be at least ${minWithdrawal} ETH`);
        return;
      }
      setError(""); // Clear any previous errors
      let tx = await atm.withdraw(ethers.utils.parseEther(withdrawalAmount));
      await tx.wait();
      getBalance();
    }
  };

  const getOwnerInfo = async () => {
    if (atm) {
      const info = await atm.getOwnerInfo();
      setOwnerInfo(info);
    }
  };

  const setLimits = async () => {
    if (atm) {
      let tx = await atm.setLimit(
        ethers.utils.parseEther(minDeposit.toString()),
        ethers.utils.parseEther(minWithdrawal.toString())
      );
      await tx.wait();
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>Please connect your Metamask wallet</button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance !== undefined ? balance : "Loading..."}</p>
        <div>
          <label>Deposit Amount (ETH):</label>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter deposit amount"
          />
        </div>
        <button onClick={deposit}>Deposit</button>
        <div>
          <label>Withdrawal Amount (ETH):</label>
          <input
            type="number"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
            placeholder="Enter withdrawal amount"
          />
        </div>
        <button onClick={withdraw}>Withdraw</button>
        <button onClick={getOwnerInfo}>Account Owner Info</button>
        <div>
          <label>Minimum Deposit (ETH):</label>
          <input
            type="number"
            value={minDeposit}
            onChange={(e) => setMinDeposit(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>Minimum Withdrawal (ETH):</label>
          <input
            type="number"
            value={minWithdrawal}
            onChange={(e) => setMinWithdrawal(parseInt(e.target.value))}
          />
        </div>
        <button onClick={setLimits}>Set Limits</button>
        {ownerInfo && (
          <div>
            <p>Owner Name: {ownerInfo[0]}</p>
            <p>Age: {ownerInfo[1].toString()}</p>
            <p>Gender: {ownerInfo[2]}</p>
            <p>Loans: {ownerInfo[3].toString()}</p>
          </div>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
