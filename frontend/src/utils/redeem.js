import { Contract, utils } from "ethers";
import { DSC_ENGIN, ERC20 } from "../config/abi";
import ADDRESS from "./../config/address.json"; // import styles from "../styles/Home.module.css";

/**
 * Deposit Collateral on  Defi to get some stable coins against it
 *
 */
export const redeemCurrencyCollateral = async (
  signer,
  tokenCollateralAddress,
  amountCollateral,
  amountToBurn,
  isBurn
) => {
  try {
    // create a new instance of the token contract
    const dsce = new Contract(ADDRESS.DSCENGIN, DSC_ENGIN, signer);

    if (isBurn) {
      // After the contract has the approval, add the ether and cd tokens in the liquidity
      tx = await dsce.redeemCollateralFroDec(
        tokenCollateralAddress,
        amountCollateral,
        amountToBurn
      );
    } else {
      tx = await dsce.redeemCollateral(
        tokenCollateralAddress,
        amountCollateral
      );
    }
    await tx.wait();
  } catch (err) {
    console.error(err);
  }
};
