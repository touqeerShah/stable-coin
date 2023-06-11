import { Contract, utils } from "ethers";
import { DSC_ENGIN, ERC20 } from "../config/abi";
import ADDRESS from "./../config/address.json"; // import styles from "../styles/Home.module.css";

/**
 * Deposit Collateral on  Defi to get some stable coins against it
 *
 */
export const deposit = async (
  signer,
  tokenCollateralAddress,
  amountCollateral,
  amountToMint,
  isMint
) => {
  try {
    // create a new instance of the token contract
    const dsce = new Contract(ADDRESS.DSCENGIN, DSC_ENGIN, signer);
    // create a new instance of the exchange contract
    const exchangeContract = new Contract(
      tokenCollateralAddress,
      ERC20,
      signer
    );
    // Because CD tokens are an ERC20, user would need to give the contract allowance
    // to take the required number CD tokens out of his contract
    let tx = await exchangeContract.approve(
      ADDRESS.DSCENGIN,
      amountCollateral.toString()
    );
    await tx.wait();
    if (isMint) {
      // After the contract has the approval, add the ether and cd tokens in the liquidity
      tx = await dsce.depostCollateralAndMintDsc(
        tokenCollateralAddress,
        amountCollateral,
        amountToMint
      );
    } else {
      tx = await dsce.depostCollateral(
        tokenCollateralAddress,
        amountCollateral
      );
    }
    await tx.wait();
  } catch (err) {
    console.error(err);
  }
};
