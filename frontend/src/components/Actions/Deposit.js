import Select, { components } from "react-select";
import React, { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/router";
import { utils } from "ethers";
import { toast } from "react-toastify";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getProviderOrSigner } from "../../utils/getProviderOrSigner";
import { depositCollateral } from "../../utils/depost";
import {
  getTokenBalance,
  calculateHealthFactor,
  getMinHealthFactor,
  getUsdValue,
} from "../../utils/getDetails";
import ADDRESS from "../../config/address.json"; // import styles from "../styles/Home.module.css";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

export default function Deposit({
  walletConnected,
  web3ModalRef,
  collateral,
  totalDSC,
}) {
  const router = useRouter();
  const [currenct, setCurrency] = useState(ADDRESS.WETH);
  const [isMint, setIsMint] = useState(false);
  const [deposit, setDeposit] = useState(0);
  const [mint, setMint] = useState(0);
  const [balance, setBalance] = useState(0);
  const [balanceUsd, setBalanceUsd] = useState(0);
  const [isHealth, SetIsHealth] = useState(false);
  const [message, setMessage] = useState("");

  // balance load
  const balanceLoad = async (currenct) => {
    const signer = await getProviderOrSigner(web3ModalRef, true);
    let balance = await getTokenBalance(signer, currenct);

    const Deposti_USD = await getUsdValue(signer, currenct, balance.toString());
    setBalanceUsd(
      utils.formatEther(utils.parseUnits(Deposti_USD.toString())) / 100000000
    );

    balance =
      utils.formatEther(utils.parseUnits(balance.toString())) / 100000000;
    setBalance(balance);
  };

  const healthCheck = async (deposit = 0, mint = 0) => {
    if (mint == "" || deposit == "") {
      return;
    }
    const signer = await getProviderOrSigner(web3ModalRef, true);

    const Deposti_USD = await getUsdValue(
      signer,
      currenct,
      utils.parseUnits(deposit.toString(), 8).toString()
    );
    console.log(
      collateral,
      "= = = USD = ==  =",
      parseFloat(collateral) + parseFloat(Deposti_USD)
    );
    let health = await calculateHealthFactor(
      signer,

      (
        parseFloat(utils.parseUnits(totalDSC.toString(), 8).toString()) +
        parseFloat(utils.parseUnits(mint.toString(), 8).toString())
      ).toString(),
      parseFloat(collateral) + parseFloat(Deposti_USD)
    );
    console.log("health", health.toString());
    const MIN_HEALTH_FACTOR = await getMinHealthFactor(signer);

    // console.log("health = ", health.toString(), MIN_HEALTH_FACTOR.toString());
    if (health.lt(MIN_HEALTH_FACTOR)) {
      console.log("unhealthy");
      SetIsHealth(true);
      setMessage("Did not allow to mint more the 50% of collateral ");
    } else {
      console.log("healthy");
      setMessage("");
      SetIsHealth(false);
    }

    // if()
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    let isLoaded = false;
    let fatch = async () => {
      balanceLoad(currenct);
    };
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    // console.log("walletConnected  = = 1", walletConnected);
    if (walletConnected && balance == 0 && !isLoaded) {
      isLoaded = true;
      fatch();
    }
  }, [walletConnected]);
  // waller action
  const validationSchema = Yup.object().shape({
    // image: Yup.string().required("NFG image is required"),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, formState } = useForm(formOptions);
  const options = [
    { value: ADDRESS.WETH, label: "WETH", icon: "weth.png" },
    { value: ADDRESS.WBTC, label: "WBTC", icon: "wbtc.png" },
  ];

  const { Option } = components;
  const IconOption = (props) => (
    <Option {...props} className="">
      <div className="grid grid-cols-2    ">
        <div>
          <span className="text-sm">{props.data.label}</span>
        </div>
        <div className="">
          <img
            src={"/" + props.data.icon}
            style={{ width: 20 }}
            alt={props.data.label}
          />
        </div>
      </div>
    </Option>
  );
  let submit = useCallback(async () => {
    console.log(deposit, mint, isMint, isHealth);
    try {
      const signer = await getProviderOrSigner(web3ModalRef, true);
      setMessage("Depositing ... ");
      SetIsHealth(true);
      await depositCollateral(signer, currenct, deposit, mint, isMint);
      toast.success("Transaction Successfully");
      setMessage("");
      SetIsHealth(false);
    } catch (error) {
      toast.error("Transaction have Issue");
      SetIsHealth(false);
    }
  }, [deposit, mint]);
  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="pt-6    ">
        <Select
          className="  customBorder w-6/12 currency-dropdown	 text-colour rounded text-md  "
          defaultValue={options[0]}
          options={options}
          components={{ Option: IconOption }}
          isSearchable={false}
          onChange={async (e) => {
            console.log("Select", e);
            setCurrency(e.value);
            balanceLoad(e.value);
            document.getElementById("postCodeForm").reset();
          }}
        />
        <input
          type="checkbox"
          className="  customBorder w-1/12 pt-2 mt-2 	 text-colour rounded text-md  "
          defaultValue=""
          onChange={(e) => {
            // console.log("check", e.currentTarget.checked);
            SetIsHealth(e.currentTarget.checked);
            setIsMint(e.currentTarget.checked);
            //   props.setStartDate(e.currentTarget.value);
          }}
        />
        <label htmlFor="vehicle1" className="text-colour mt-2 mb-4">
          {" "}
          is Mint{" "}
        </label>
        <br />
        <label htmlFor="vehicle1" className=" w-full   text-colour">
          {" "}
          Amount Deposit{" "}
        </label>
        <br />
        <input
          type="number"
          className="  customBorder w-6/12 p-2 mt-2 float-left text-colour rounded text-md  "
          defaultValue=""
          min={0}
          // value={deposit}
          max={balance}
          onChange={(e) => {
            // props.setStartDate(e.currentTarget.value);
            if (e.currentTarget.value == "") {
              setDeposit(0);
              return;
            }
            if (parseFloat(e.currentTarget.value) <= parseFloat(balance)) {
              // console.log("e.currentTarget.value", e.currentTarget.value);

              setDeposit(e.currentTarget.value);
            } else {
              e.currentTarget.value = balance;
            }
          }}
        />
        <label
          htmlFor="vehicle1"
          className=" w-full  mt-2  float-left text-colour"
        >
          {" "}
          Balance ({balance}/{balanceUsd} $){" "}
        </label>
        {isMint && (
          <>
            {" "}
            <label
              htmlFor="vehicle1"
              className=" w-full  p-2 mt-2  float-left text-colour"
            >
              {" "}
              Amount Mint{" "}
            </label>
            <input
              type="number"
              className="  customBorder w-6/12 p-2 mt-2 float-left	 text-colour rounded text-md  "
              defaultValue=""
              min={0}
              // value={mint}
              disabled={deposit == 0 || deposit == ""}
              onChange={(e) => {
                // console.log("e.currentTarget.value", e.currentTarget.value);
                healthCheck(deposit, e.currentTarget.value);
                setMint(e.currentTarget.value);
              }}
            />
          </>
        )}
        {message && (
          <div className="w-full pt-2 float-left   ">
            <span className="text-colour">
              {message} {}
              {message.indexOf("Depositing") != -1 && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className={"text-sm text-colour pr-2 fa-spin"}
                />
              )}
            </span>
          </div>
        )}
        <div className="w-full float-left   ">
          <button
            className="  relative  center  customBorder action-button w-6/12 p-2 mt-2 float-left	 text-colour rounded text-md  "
            disabled={isHealth}
            type="submit"
            onClick={() => {
              console.log("click");
            }}
          >
            {/* {spinnerProcess && (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              )}{" "} */}
            Deposit
          </button>
        </div>
      </div>
    </form>
  );
}
