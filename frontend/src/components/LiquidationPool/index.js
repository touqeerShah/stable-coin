import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  faCartPlus,
  faArrowUpRightDots,
  faAddressCard,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";

import Row from "./row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LiquidationPool() {
  const router = useRouter();
  const [selected, setSelected] = useState("Deposit");

  return (
    <div className="p-3">
      <div className="relative customBorder overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm  table-auto overflow-x-scroll text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase dark:text-gray-400">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-colour bg-gray-50 dark:bg-gray-800"
              >
                <FontAwesomeIcon
                  icon={faAddressCard}
                  className={"text-sm text-colour pr-2 "}
                />{" "}
                Address
              </th>
              <th scope="col" className="px-6 text-colour py-3">
                <FontAwesomeIcon
                  icon={faWaveSquare}
                  className={"text-sm text-colour pr-2 "}
                />{" "}
                Health
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-colour bg-gray-50 dark:bg-gray-800"
              >
                <FontAwesomeIcon
                  icon={faArrowUpRightDots}
                  className={"text-sm text-colour pr-2 "}
                />{" "}
                Amount Pay/Profit
              </th>
              <th scope="col" className="px-6 text-colour py-3">
                <FontAwesomeIcon
                  icon={faCartPlus}
                  className={"text-sm text-colour pr-2 "}
                />{" "}
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <Row
              address={"0xCBc477A6483E89B0267e1837Ff233B87D5943988"}
              health={"0.2"}
              amountPay={"100$"}
              amountProfit={"150$"}
            />
            <Row
              address={"0xCBc477A6483E89B0267e1837Ff233B87D5943988"}
              health={"0.2"}
              amountPay={"100$"}
              amountProfit={"150$"}
            />
            <Row
              address={"0xCBc477A6483E89B0267e1837Ff233B87D5943988"}
              health={"0.2"}
              amountPay={"100$"}
              amountProfit={"150$"}
            />
            <Row
              address={"0xCBc477A6483E89B0267e1837Ff233B87D5943988"}
              health={"0.2"}
              amountPay={"100$"}
              amountProfit={"150$"}
            />
            <Row
              address={"0xCBc477A6483E89B0267e1837Ff233B87D5943988"}
              health={"0.2"}
              amountPay={"100$"}
              amountProfit={"150$"}
            />{" "}
            <Row
              address={"0xCBc477A6483E89B0267e1837Ff233B87D5943988"}
              health={"0.2"}
              amountPay={"100$"}
              amountProfit={"150$"}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
