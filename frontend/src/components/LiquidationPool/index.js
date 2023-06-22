import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  faCartPlus,
  faArrowUpRightDots,
  faAddressCard,
  faWaveSquare,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useApolloClient } from "@apollo/client";
import ADDRESS from "../../config/address.json"; // import styles from "../styles/Home.module.css";

import Row from "./row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GET_ALL_DEPOSIT_ACCOUNTS } from "../../utils/subgrapQueries";
import { init, getAccountInformation } from "../../utils/getDetails";
export default function LiquidationPool({ walletConnected, web3ModalRef }) {
  const router = useRouter();
  const [depositAccount, setDepositAccount] = useState([]);
  const subgraphClient = useApolloClient();

  useEffect(() => {
    // console.log("documentDetails && showModal", documentDetails, showModal, isSigner);

    const fetchData = async () => {
      try {
        try {
          const _depositAccount = await subgraphClient.query({
            query: GET_ALL_DEPOSIT_ACCOUNTS,
          });
          console.log("depositAccount.data", _depositAccount.data);
          const signer = await getProviderOrSigner(web3ModalRef, true);

          for (let index = 0; index < _depositAccount.data.length; index++) {
            const element = _depositAccount.data[index];
            let response = await init(signer, element.depositor);

            if (
              response &&
              BigInt(response.totalCollateral.toString()).lt(0) &&
              BigInt(response.totalDSC.toString()).lt(0)
            ) {
              let responseHealthCheck = await healthCheck(
                web3ModalRef,
                "",
                response.collateralETH.toString(),
                response.totalDSC.toString(),
                0,
                0,
                false
              );

              depositAccount.push({
                token: ADDRESS.WETH,
                address: element.depositor,
                totalUSD: response.ethUSD + response.btcUSD,
                health: response.health,
                responseHealthCheck: responseHealthCheck,
              });

              responseHealthCheck = await healthCheck(
                web3ModalRef,
                "",
                response.collateralETH.toString(),
                response.totalDSC.toString(),
                0,
                0,
                false
              );

              depositAccount.push({
                token: ADDRESS.WBTC,
                address: element.depositor,
                totalUSD: response.ethUSD + response.btcUSD,
                health: response.health,
                responseHealthCheck: responseHealthCheck,
              });
              setDepositAccount(depositAccount);
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
            {depositAccount.length != 0 && (
              <Row
                address={"0xCBc477A6483E89B0267e1837Ff233B87D5943988"}
                health={"0.2"}
                amountPay={"100$"}
                amountProfit={"150$"}
              />
            )}
            {depositAccount.length == 0 && (
              <span className="  relative  center   action-button w-full p-2 mt-2 float-left	 text-colour rounded text-md  ">
                Loading ...{" "}
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              </span>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
