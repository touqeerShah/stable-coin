import Head from "next/head";
import Action from "../components/Actions";
import LiquidationPool from "../components/LiquidationPool";
import Account from "../components/AccountDetails";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={"main "}>
        <div className="w-5/12	float-left		 ">
          <div className="w-full action">
            <Action></Action>
          </div>
          <div className="w-full detail">
            {" "}
            <Account />
          </div>
        </div>
        <div className="w-6/12 float-left	 top-0	liquidated-pool">
          <LiquidationPool />
        </div>
      </div>
    </div>
  );
}
