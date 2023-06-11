import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  faMoneyBillTrendUp,
  faBurn,
  faMoneyBillTransfer,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Account() {
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
              Total WETH Collateral : 100
            </th>
            <td className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              Total WBTC Collateral : 100
            </td>
          </tr>
          <tr className="bg-white w-full dark:bg-gray-800">
            <th
              scope="row"
              className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              Total Collateral $ : 100
            </th>
            <td className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              Total DSC Minted : 100
            </td>
          </tr>
          <tr className="bg-white w-full dark:bg-gray-800">
            <th
              scope="row"
              className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              Health : 100
            </th>
            <td className="px-6 w-6/12	 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              Total Coin Can Minted : 100
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
