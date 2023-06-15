import Select, { components } from "react-select";
import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { utils } from "ethers";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { getProviderOrSigner } from "../../utils/getProviderOrSigner";
import { healthCheck } from "../../utils/getDetails";
import { mintDSC } from "../../utils/mint";
export default function Mint({
  walletConnected,
  web3ModalRef,
  totalCollateral,
  totalDSC,
}) {
  const router = useRouter();
  const [deposit, setDeposit] = useState(0);
  const [mint, setMint] = useState(0);
  const [message, setMessage] = useState("");
  const [isHealth, setIsHealth] = useState(false);

  const validationSchema = Yup.object().shape({
    // image: Yup.string().required("NFG image is required"),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, formState } = useForm(formOptions);

  let signDocument = useCallback(async (event) => {
    try {
      if (!walletConnected) {
        toast.error("Wallet Not Connected ");
      }
      const signer = await getProviderOrSigner(web3ModalRef, true);
      setMessage("Depositing ... ");
      setIsHealth(true);
      await mintDSC(signer, mint);
      toast.success("Transaction Successfully");
      setMessage("");
      setIsHealth(false);
    } catch (error) {
      toast.error("Transaction have Issue");
      setIsHealth(false);
    }
  }, []);
  return (
    <form onSubmit={handleSubmit(signDocument)}>
      <div className="pt-6    ">
        <label htmlFor="vehicle1" className=" w-full   text-colour">
          {" "}
          Mint stable Coint{" "}
        </label>
        <br />
        <input
          type="number"
          className="  customBorder w-6/12 p-2 mt-2 float-left text-colour rounded text-md  "
          defaultValue=""
          min={0}
          onChange={async (e) => {
            console.log("e.currentTarget.value", e.currentTarget.value);
            //   props.setStartDate(e.currentTarget.value);
            setMint(e.currentTarget.value);
            let response = await healthCheck(
              web3ModalRef,
              "",
              totalDSC,
              totalCollateral,
              0,
              e.currentTarget.value,
              false
            );
            setMessage(response.message);
            setIsHealth(response.isHealthy);
          }}
        />

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
            type="submit"
            disabled={isHealth}
          >
            {/* {spinnerProcess && (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              )}{" "} */}
            Mint
          </button>
        </div>
      </div>
    </form>
  );
}
