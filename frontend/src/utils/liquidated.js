import { Contract, utils } from "ethers";
import { DSC_ENGIN, ERC20 } from "../config/abi";
import ADDRESS from "./../config/address.json"; // import styles from "../styles/Home.module.css";

/**
 * Deposit Collateral on  Defi to get some stable coins against it
 *
 */
export const liquidated = async (
  signer,
  tokenCollateralAddress,
  defaultUser,
  amountDeposit
) => {
  try {
    console.log(
      tokenCollateralAddress,
      defaultUser,
      "amountDeposit",
      amountDeposit
    );
    // create a new instance of the token contract
    const dsce = new Contract(ADDRESS.DSCENGIN, DSC_ENGIN, signer);
    const dsc = new Contract(ADDRESS.DSC, ERC20, signer);
    // Because CD tokens are an ERC20, user would need to give the contract allowance
    // to take the required number CD tokens out of his contract
    // let tx = await dsc.approve(ADDRESS.DSCENGIN, amountDeposit.toString());
    // await tx.wait();

    // After the contract has the approval, add the ether and cd tokens in the liquidity
    tx = await dsce.liquidate(
      tokenCollateralAddress,
      defaultUser,
      amountDeposit.toString()
    );
    await tx.wait();
  } catch (err) {
    console.error(err);
  }
};
