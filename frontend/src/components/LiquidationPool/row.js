import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import copy from "clipboard-copy";
import { toast } from "react-toastify";

export default function Row({ address, health, amountPay, amountProfit }) {
  return (
    <tr className="border-b  border-gray-200 dark:border-gray-700">
      <th
        scope="row"
        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
      >
        {address}{" "}
        <FontAwesomeIcon
          icon={faCopy}
          onClick={() => {
            copy(address);
            toast.info("Address Copy");
          }}
          className={"text-sm text-colour pr-2  hover:text-sky-600		"}
        />{" "}
      </th>
      <td className="px-6 py-4">{health}</td>
      <td className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
        {amountPay}/{amountProfit}
      </td>
      <td className="px-6 py-4 text-sky-200 underline fa-fade">Buy</td>
    </tr>
  );
}
