import { Contract, utils } from "ethers";
import { ERC20 } from "../config/abi";
import ADDRESS from "./../config/address.json"; // import styles from "../styles/Home.module.css";

/**
 * Deposit Collateral on  Defi to get some stable coins against it
 *
 */
export const getTokenBalance = async (signer, tokenCollateralAddress) => {
  try {
    // create a new instance of the token contract
    const exchangeContract = new Contract(
      tokenCollateralAddress,
      ERC20,
      signer
    );
    // Because CD tokens are an ERC20, user would need to give the contract allowance
    // to take the required number CD tokens out of his contract
    return await exchangeContract.balance();
  } catch (err) {
    console.error(err);
  }
};

export const getAccountInformation = async (signer) => {
  try {
    const dsce = new Contract(ADDRESS.DSCENGIN, DSC_ENGIN, signer);
    const address = await signer.getAddress();
    // Because CD tokens are an ERC20, user would need to give the contract allowance
    // to take the required number CD tokens out of his contract
    return await dsce.getAccountInformation(address);
  } catch (err) {
    console.error(err);
  }
};

export const getHealthFactory = async (signer) => {
  try {
    const dsce = new Contract(ADDRESS.DSCENGIN, DSC_ENGIN, signer);
    const address = await signer.getAddress();
    // Because CD tokens are an ERC20, user would need to give the contract allowance
    // to take the required number CD tokens out of his contract
    return await dsce.getHealthFactory();
  } catch (err) {
    console.error(err);
  }
};

export const getCollateralBalanceOfUser = async (
  signer,
  tokenCollateralAddress
) => {
  try {
    const dsce = new Contract(ADDRESS.DSCENGIN, DSC_ENGIN, signer);
    const address = await signer.getAddress();
    // Because CD tokens are an ERC20, user would need to give the contract allowance
    // to take the required number CD tokens out of his contract
    return await dsce.getCollateralBalanceOfUser(
      address,
      tokenCollateralAddress
    );
  } catch (err) {
    console.error(err);
  }
};
