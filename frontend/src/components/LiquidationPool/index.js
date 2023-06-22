import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  faCartPlus,
  faArrowUpRightDots,
  faAddressCard,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useApolloClient } from "@apollo/client";

import Row from "./row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GET_ALL_DEPOSIT_ACCOUNTS } from "../../utils/subgrapQueries";
import { getTokenBalance, getAccountInformation } from "../../utils/getDetails";
export default function LiquidationPool({ walletConnected, web3ModalRef }) {
  const router = useRouter();
  const [depositAccount, setDepositAccount] = useState([]);
  const subgraphClient = useApolloClient();

  useEffect(() => {
    // console.log("documentDetails && showModal", documentDetails, showModal, isSigner);

    const fetchData = async () => {
      try {
        try {
          const depositAccount = await subgraphClient.query({
            query: GET_ALL_DEPOSIT_ACCOUNTS,
          });
          console.log("depositAccount.data", depositAccount.data);
          const signer = await getProviderOrSigner(web3ModalRef, true);

          for (let index = 0; index < depositAccount.data.length; index++) {
            const element = depositAccount.data[index];
            let accountDetails = await getAccountInformation(
              signer,
              element.depositor
            );
            if (
              accountDetails &&
              BigInt(
                accountDetails["totalDscMinted"].toString().lt(0) &&
                  BigInt(
                    accountDetails["collateralValueInUsd"].toString().lt(0)
                  )
              )
            ) {
              let response = await healthCheck(
                web3ModalRef,
                "",
                accountDetails["totalDscMinted"].toString(),
                accountDetails["collateralValueInUsd"].toString(),
                0,
                0,
                false
              );
            }
          }
        } catch (error) {}
        setUriData(data);
      } catch (error) {}
    };
    console.log("depositAccount.length", depositAccount.length);
    if (depositAccount.length == 0) {
      fetchData();
    }
  }, []);
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
