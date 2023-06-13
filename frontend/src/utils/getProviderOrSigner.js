import { providers, Contract } from "ethers";

export const getProviderOrSigner = async (web3ModalRef, needSigner = false) => {
  // Connect to Metamask
  // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider);

  // If user is not connected to the Sepolia network, let them know and throw an error
  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 11155111) {
    window.alert("Change the network to Sepolia");
    throw new Error("Change network to Sepolia");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
};
