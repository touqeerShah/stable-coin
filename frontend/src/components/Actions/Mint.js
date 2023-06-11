import Select, { components } from "react-select";
import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/router";
import {
  faMoneyBillTrendUp,
  faBurn,
  faMoneyBillTransfer,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

export default function Mint() {
  const router = useRouter();
  const [deposit, setDeposit] = useState(0);
  const [mint, setMint] = useState(0);

  const validationSchema = Yup.object().shape({
    // image: Yup.string().required("NFG image is required"),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, formState } = useForm(formOptions);

  let signDocument = useCallback((event) => {}, []);
  return (
    <form onSubmit={handleSubmit(signDocument)}>
      <div className="pt-6    ">
        <label for="vehicle1" className=" w-full   text-colour">
          {" "}
          Mint stable Coint{" "}
        </label>
        <br />
        <input
          type="number"
          className="  customBorder w-6/12 p-2 mt-2 float-left text-colour rounded text-md  "
          defaultValue=""
          min={0}
          onChange={(e) => {
            console.log("e.currentTarget.value", e.currentTarget.value);
            //   props.setStartDate(e.currentTarget.value);
            setDeposit(e.currentTarget.value);
          }}
        />
        <label for="vehicle1" className=" w-full  mt-2  float-left text-colour">
          {" "}
          Allow To Healthy Mint (0){" "}
        </label>

        <div className="w-full float-left   ">
          <button
            className="  relative  center  customBorder action-button w-6/12 p-2 mt-2 float-left	 text-colour rounded text-md  "
            type="submit"
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
