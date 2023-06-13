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

export default function Redeem() {
  const router = useRouter();
  const [currenct, setCurrency] = useState("");
  const [isBurn, setIsBurn] = useState(false);
  const [redeem, setRedeem] = useState(0);
  const [burn, setBurn] = useState(0);

  const validationSchema = Yup.object().shape({
    // image: Yup.string().required("NFG image is required"),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, formState } = useForm(formOptions);
  const options = [
    { value: "WETH", label: "WETH", icon: "weth.png" },
    { value: "WBTC", label: "WBTC", icon: "wbtc.png" },
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
  let signDocument = useCallback((event) => {}, []);
  return (
    <form onSubmit={handleSubmit(signDocument)}>
      <div className="pt-6    ">
        <Select
          className="  customBorder w-6/12 currency-dropdown	 text-colour rounded text-md  "
          defaultValue={options[0]}
          options={options}
          components={{ Option: IconOption }}
          isSearchable={false}
          onChange={(e) => {
            console.log("Select", e);
            setCurrency(e.value);
          }}
        />
        <input
          type="checkbox"
          className="  customBorder w-1/12 pt-2 mt-2 	 text-colour rounded text-md  "
          defaultValue=""
          onChange={(e) => {
            console.log("check", e.currentTarget.checked);
            setIsBurn(e.currentTarget.checked);
            //   props.setStartDate(e.currentTarget.value);
          }}
        />
        <label htmlFor="vehicle1" className="text-colour mt-2 mb-4">
          {" "}
          Want to Burn Some Coin{" "}
        </label>
        <br />
        <label htmlFor="vehicle1" className=" w-full   text-colour">
          {" "}
          Amount Redeem{" "}
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
            setRedeem(e.currentTarget.value);
          }}
        />
        <label
          htmlFor="vehicle1"
          className=" w-full  mt-2  float-left text-colour"
        >
          {" "}
          Collateral (){" "}
        </label>
        {isBurn && (
          <>
            {" "}
            <label
              htmlFor="vehicle1"
              className=" w-full  p-2 mt-2  float-left text-colour"
            >
              {" "}
              Burn Coin{" "}
            </label>
            <input
              type="number"
              className="  customBorder w-6/12 p-2 mt-2 float-left	 text-colour rounded text-md  "
              defaultValue=""
              disabled={redeem == 0}
              onChange={(e) => {
                //   props.setStartDate(e.currentTarget.value);
              }}
            />
          </>
        )}
        <div className="w-full float-left   ">
          <button
            className="  relative  center  customBorder action-button w-6/12 p-2 mt-2 float-left	 text-colour rounded text-md  "
            type="submit"
          >
            {/* {spinnerProcess && (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              )}{" "} */}
            Redeem
          </button>
        </div>
      </div>
    </form>
  );
}
