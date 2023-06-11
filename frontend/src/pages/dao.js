import { Contract, providers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";

import { TK_NFT, DAO_ABI } from "../config/abi";

import ADDRESS from "../config/address.json"; // import styles from "../styles/Home.module.css";

export default function Home() {
  // ETH Balance of the DAO contract
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  // Number of proposals created in the DAO
  const [numProposals, setNumProposals] = useState("0");
  // Array of all proposals created in the DAO
  const [proposals, setProposals] = useState([]);
  const [proposalDetails, setProposalDetails] = useState({});

  // User's balance of TK Devs NFTs
  const [nftBalance, setNftBalance] = useState(0);
  // Fake NFT Token ID to purchase. Used when creating a proposal.
  const [fakeNftTokenId, setFakeNftTokenId] = useState("");
  // One of "Create Proposal" or "View Proposals"
  const [selectedTab, setSelectedTab] = useState("");
  // True if waiting for a transaction to be mined, false otherwise.
  const [loading, setLoading] = useState(false);
  // True if user has connected their wallet, false otherwise
  const [walletConnected, setWalletConnected] = useState(false);
  // isOwner gets the owner of the contract through the signed address
  const [isOwner, setIsOwner] = useState(false);
  const web3ModalRef = useRef();

  // Helper function to connect wallet
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * getOwner: gets the contract owner by connected address
   */
  const getDAOOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = getDaoContractInstance(signer);

      // call the owner function from the contract
      const _owner = await contract.owner();
      // Get the address associated to signer which is connected to Metamask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  /**
   * withdrawCoins: withdraws ether by calling
   * the withdraw function in the contract
   */
  const withdrawDAOEther = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = getDaoContractInstance(signer);

      const tx = await contract.withdrawEther();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      getDAOTreasuryBalance();
    } catch (err) {
      console.error(err);
      window.alert(err.reason);
    }
  };

  // Reads the ETH balance of the DAO contract and sets the `treasuryBalance` state variable
  const getDAOTreasuryBalance = async () => {
    try {
      const provider = await getProviderOrSigner();
      const balance = await provider.getBalance(ADDRESS.TKDevsDAO);
      setTreasuryBalance(balance.toString());
    } catch (error) {
      console.error(error);
    }
  };

  // Reads the number of proposals in the DAO contract and sets the `numProposals` state variable
  const getNumProposalsInDAO = async () => {
    try {
      const provider = await getProviderOrSigner();
      const contract = getDaoContractInstance(provider);
      const daoNumProposals = await contract.numProposals();
      setNumProposals(daoNumProposals.toString());
    } catch (error) {
      console.error(error);
    }
  };

  // Reads the balance of the user's TK Devs NFTs and sets the `nftBalance` state variable
  const getUserNFTBalance = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = getTKdevsNFTContractInstance(signer);
      const balance = await nftContract.balanceOf(signer.getAddress());
      setNftBalance(parseInt(balance.toString()));
    } catch (error) {
      console.error(error);
    }
  };

  // Calls the `createProposal` function in the contract, using the tokenId from `fakeNftTokenId`
  const createProposal = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);
      const txn = await daoContract.createProposal(fakeNftTokenId);
      setLoading(true);
      await txn.wait();
      await getNumProposalsInDAO();
      setLoading(false);
    } catch (error) {
      console.error(error);
      window.alert(error.reason);
    }
  };

  // Helper function to fetch and parse one proposal from the DAO contract
  // Given the Proposal ID
  // and converts the returned data into a Javascript object with values we can use
  const fetchProposalById = async (id) => {
    try {
      const provider = await getProviderOrSigner();
      const daoContract = getDaoContractInstance(provider);
      const proposal = await daoContract.proposals(id);
      //   console.log("fetchProposalById", proposal);
      const parsedProposal = {
        proposalId: id,
        nftTokenId: proposal.nftTokenId.toString(),
        deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
        yesVotes: proposal.yesVotes.toString(),
        noVotes: proposal.noVotes.toString(),
        executed: proposal.executed,
      };
      //   console.log("parsedProposal", parsedProposal);

      return parsedProposal;
    } catch (error) {
      console.error(error);
    }
  };

  // Runs a loop `numProposals` times to fetch all proposals in the DAO
  // and sets the `proposals` state variable
  const fetchAllProposals = async () => {
    try {
      const proposals = [];
      console.log("numProposals", numProposals);
      for (let i = 0; i < numProposals; i++) {
        const proposal = await fetchProposalById(i);
        // console.log("proposal=>", numProposals);

        proposals.push(proposal);
      }
      //   console.log("proposals", proposals);
      setProposals(proposals);
      proposals.length > 0 ? getProposalDetails(0, proposals) : "";
      return proposals;
    } catch (error) {
      console.error(error);
    }
  };

  // Calls the `voteOnProposal` function in the contract, using the passed
  // proposal ID and Vote
  const voteOnProposal = async (proposalId, _vote) => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);

      let vote = _vote === "YES" ? 0 : 1;
      const txn = await daoContract.voteOnProposal(proposalId, vote);
      setLoading(true);
      await txn.wait();
      setLoading(false);
      await fetchAllProposals();
    } catch (error) {
      console.error(error);
      window.alert(error.reason);
    }
  };

  // Calls the `executeProposal` function in the contract, using
  // the passed proposal ID
  const executeProposal = async (proposalId) => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);
      const txn = await daoContract.executeProposal(proposalId);
      setLoading(true);
      await txn.wait();
      setLoading(false);
      await fetchAllProposals();
      getDAOTreasuryBalance();
    } catch (error) {
      console.error(error);
      window.alert(error.reason);
    }
  };

  // Helper function to fetch a Provider/Signer instance from Metamask
  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 11155111) {
      window.alert("Please switch to the sepolia network!");
      throw new Error("Please switch to the sepolia network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // Helper function to return a DAO Contract instance
  // given a Provider/Signer
  const getDaoContractInstance = (providerOrSigner) => {
    return new Contract(ADDRESS.TKDevsDAO, DAO_ABI, providerOrSigner);
  };

  // Helper function to return a TK Devs NFT Contract instance
  // given a Provider/Signer
  const getTKdevsNFTContractInstance = (providerOrSigner) => {
    return new Contract(ADDRESS.TKDevs, TK_NFT, providerOrSigner);
  };

  // Helper function to return a DAO Contract instance
  // given a Provider/Signer
  const getProposalDetails = (index, proposals) => {
    console.log("getProposalDetails", index);
    setProposalDetails(proposals[index]);
    renderViewProposalsTab();
  };

  // piece of code that runs everytime the value of `walletConnected` changes
  // so when a wallet connects or disconnects
  // Prompts user to connect wallet if not connected
  // and then calls helper functions to fetch the
  // DAO Treasury Balance, User NFT Balance, and Number of Proposals in the DAO
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet().then(() => {
        getDAOTreasuryBalance();
        getUserNFTBalance();
        getNumProposalsInDAO();
        getDAOOwner();
      });
    }
  }, [walletConnected]);

  // Piece of code that runs everytime the value of `selectedTab` changes
  // Used to re-fetch all proposals in the DAO when user switches
  // to the 'View Proposals' tab
  useEffect(() => {
    if (selectedTab === "View Proposals") {
      fetchAllProposals();
    }
  }, [selectedTab]);

  // Render the contents of the appropriate tab based on `selectedTab`
  function renderTabs() {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalTab();
    } else if (selectedTab === "View Proposals") {
      return renderViewProposalsTab();
    }
    return null;
  }

  // Renders the 'Create Proposal' tab content
  function renderCreateProposalTab() {
    if (loading) {
      return (
        <div className={"description"}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (nftBalance === 0) {
      return (
        <div className={"description"}>
          You do not own any TK Devs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    } else {
      return (
        <div className={"container"}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-black bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            onChange={(e) => setFakeNftTokenId(e.target.value)}
          />
          <button className={"button2"} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  }

  // Renders the 'View Proposals' tab content
  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={"description"}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={"description"}>No proposals have been created</div>
      );
    } else if (proposals.length !== 0) {
      return (
        <div>
          <select
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-black bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            onChange={(e) => {
              console.log("e.target.value", e.target.value);
              getProposalDetails(e.target.value, proposals);
            }}
          >
            <option disabled>Choose Proposal Id</option>
            {proposals.map((p, index) => (
              <option key={index} value={index}>
                {p.proposalId}
              </option>
            ))}
          </select>
          <div>
            {proposalDetails && (
              <div className={"proposalCard"}>
                <p>Proposal ID: {proposalDetails.proposalId}</p>
                <p>Fake NFT to Purchase: {proposalDetails.nftTokenId}</p>
                <p>Deadline: {proposalDetails.deadline.toLocaleString()}</p>
                <p>Yes Votes: {proposalDetails.yesVotes}</p>
                <p>No Votes: {proposalDetails.noVotes}</p>
                <p>Executed?: {proposalDetails.executed.toString()}</p>
                {proposalDetails.deadline.getTime() > Date.now() &&
                !proposalDetails.executed ? (
                  <div className={"flex"}>
                    <button
                      className={"button2"}
                      onClick={() =>
                        voteOnProposal(proposalDetails.proposalId, "YES")
                      }
                    >
                      Vote yes
                    </button>
                    <button
                      className={"button2"}
                      onClick={() =>
                        voteOnProposal(proposalDetails.proposalId, "NO")
                      }
                    >
                      Vote NO
                    </button>
                  </div>
                ) : proposalDetails.deadline.getTime() < Date.now() &&
                  !proposalDetails.executed ? (
                  <div className={"flex"}>
                    <button
                      className={"button2"}
                      onClick={() =>
                        executeProposal(proposalDetails.proposalId)
                      }
                    >
                      Execute Proposal{" "}
                      {proposalDetails.yesVotes > proposalDetails.noVotes
                        ? "(YES)"
                        : "(NO)"}
                    </button>
                  </div>
                ) : (
                  <div className={"description"}>Proposal Executed</div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <div>
      <Head>
        <title>TK Devs DAO</title>
        <meta name="description" content="TK Devs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={"main"}>
        <div>
          <h1 className={"title"}>Welcome to Crypto Devs!</h1>
          <div className={"description"}>Welcome to the DAO!</div>
          <div className={"description"}>
            Your TK Devs NFT Balance: {nftBalance}
            <br />
            Treasury Balance: {formatEther(treasuryBalance)} ETH
            <br />
            Total Number of Proposals: {numProposals}
          </div>
          <div className={"flex"}>
            <button
              className={"button"}
              onClick={() => setSelectedTab("Create Proposal")}
            >
              Create Proposal
            </button>
            <button
              className={"button"}
              onClick={() => setSelectedTab("View Proposals")}
            >
              View Proposals
            </button>
          </div>
          {renderTabs()}
          {/* Display additional withdraw button if connected wallet is owner */}
          {isOwner ? (
            <div>
              {loading ? (
                <button className={"button"}>Loading...</button>
              ) : (
                <button className={"button"} onClick={withdrawDAOEther}>
                  Withdraw DAO ETH
                </button>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
        <div>
          <img
            className={"image"}
            alt="bc"
            src="./blockchain-future-background-animated-YIIkq3pavF-watermarked.png"
          />
        </div>
      </div>
    </div>
  );
}
