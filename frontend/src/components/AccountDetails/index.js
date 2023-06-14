import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { utils } from "ethers";

export default function Account({
  collateral,
  collateralETH,
  collateralBTC,
  totalDSC,
  health,
} = props) {
  console.log("totalDSC", collateral);
  const router = useRouter();
  const [selected, setSelected] = useState("Deposit");

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <tbody>
          <tr className="bg-white w-full dark:bg-gray-800">
            <th
              scope="row"
              className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              Total WETH Collateral : {collateralETH}
            </th>
            <td className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              Total WBTC Collateral : {collateralBTC}
            </td>
          </tr>
          <tr className="bg-white w-full dark:bg-gray-800">
            <th
              scope="row"
              className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              Total Collateral $ :{" "}
              {collateral ? (collateral / 100000000).toString() : 0} $
            </th>
            <td className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              Total DSC Minted :{" "}
              {totalDSC ? (totalDSC.toString() / 100000000).toString() : 0}
            </td>
          </tr>
          <tr className="bg-white w-full dark:bg-gray-800">
            <th
              scope="row"
              className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              Health : {totalDSC == 0 ? 0 : health}
            </th>
            {/* <td className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              Total Coin Can Minted : 100
            </td> */}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
