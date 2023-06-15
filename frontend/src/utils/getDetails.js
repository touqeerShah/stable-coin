import { Contract, utils } from "ethers";
import { ERC20, DSC_ENGIN } from "../config/abi";
import ADDRESS from "./../config/address.json"; // import styles from "../styles/Home.module.css";
import { getProviderOrSigner } from "./getProviderOrSigner";
let constant = 100000000;

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
    const address = signer.getAddress();
    return await exchangeContract.balanceOf(address);
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

export const calculateHealthFactor = async (
  signer,
  totalDscMinted,
  collateralValueInUsd
) => {
  try {
    const dsce = new Contract(ADDRESS.DSCENGIN, DSC_ENGIN, signer);
    const address = await signer.getAddress();
    // Because CD tokens are an ERC20, user would need to give the contract allowance
    // to take the required number CD tokens out of his contract
    return await dsce.calculateHealthFactor(
      totalDscMinted,
      collateralValueInUsd
    );
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

export const getMinHealthFactor = async (signer) => {
  try {
    const dsce = new Contract(ADDRESS.DSCENGIN, DSC_ENGIN, signer);
    const address = await signer.getAddress();
    // Because CD tokens are an ERC20, user would need to give the contract allowance
    // to take the required number CD tokens out of his contract
    return await dsce.getMinHealthFactor();
  } catch (err) {
    console.error(err);
  }
};

export const getUsdValue = async (signer, tokenCollateralAddress, amount) => {
  try {
    const dsce = new Contract(ADDRESS.DSCENGIN, DSC_ENGIN, signer);
    const address = await signer.getAddress();

    // Because CD tokens are an ERC20, user would need to give the contract allowance
    // to take the required number CD tokens out of his contract
    return await dsce.getUsdValue(tokenCollateralAddress, amount);
  } catch (err) {
    console.error(err);
  }
};

export const healthCheck = async (
  web3ModalRef,
  currenct,
  totalDSC,
  totalCollateral,
  collateral = 0,
  coin = 0,
  isReedem = false
) => {
  if (coin == "") {
    return;
  }
  const signer = await getProviderOrSigner(web3ModalRef, true);
  let collateralUSD = 0;
  let health = 0;
  if (totalCollateral == 0) {
    return {
      isHealthy: true,
      message: "Add Collateral First !",
    };
  }
  if (currenct != "") {
    if (collateral == "") {
      return;
    }
    collateralUSD = await getUsdValue(
      signer,
      currenct,
      utils.parseUnits(collateral.toString(), 8).toString()
    );
  }

  if (isReedem) {
    health = await calculateHealthFactor(
      signer,

      (
        parseFloat(totalDSC.toString()) +
        parseFloat(utils.parseUnits(coin.toString(), 8).toString())
      ).toString(),
      parseFloat(totalCollateral) - parseFloat(collateralUSD)
    );
  }
  if (isReedem) {
    health = await calculateHealthFactor(
      signer,

      (
        parseFloat(totalDSC.toString()) -
        parseFloat(utils.parseUnits(coin.toString(), 8).toString())
      ).toString(),
      parseFloat(totalCollateral) - parseFloat(collateralUSD)
    );
  }
  console.log("health", health.toString());
  const MIN_HEALTH_FACTOR = await getMinHealthFactor(signer);

  // console.log("health = ", health.toString(), MIN_HEALTH_FACTOR.toString());
  if (health && health.lt(MIN_HEALTH_FACTOR)) {
    console.log("unhealthy");
    // SetIsHealth(true);
    // setMessage("Did not allow to mint more the 50% of collateral ");
    return {
      isHealthy: true,
      message: "Did not allow to mint more the 50% of collateral ",
    };
  } else {
    console.log("healthy");
    // setMessage("");
    // SetIsHealth(false);
    return { isHealthy: false, message: "" };
  }

  // if()
};

export const balanceLoad = async (currenct, web3ModalRef) => {
  const signer = await getProviderOrSigner(web3ModalRef, true);
  let balance = 0,
    balanceUSD = 0;

  balance = await getTokenBalance(signer, currenct);
  if (balance) {
    console.log(currenct, "balancebalancebalancebalance", balance.toString());
    balanceUSD = await getUsdValue(signer, currenct, balance.toString());
    console.log("balanceUSD", balanceUSD);
    balanceUSD =
      utils.formatEther(utils.parseUnits(balanceUSD.toString())) / 100000000;
    balance =
      utils.formatEther(utils.parseUnits(balance.toString())) / 100000000;
  }
  return { balance, balanceUSD };
};

export const checkCollateral = async (currenct, web3ModalRef) => {
  const signer = await getProviderOrSigner(web3ModalRef, true);

  let _collateral = await getCollateralBalanceOfUser(signer, currenct);
  let _btcUSD = await getUsdValue(signer, currenct, _collateral.toString());

  return {
    collateral: (_collateral == 0 ? 0 : _collateral / constant).toString(),
    collateralUSD: (_btcUSD == 0 ? 0 : _btcUSD / constant).toString(),
  };
};
