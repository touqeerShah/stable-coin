import "@/styles/globals.css";
import RootLayout from "../layouts/RootLayout";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
export default function App({ Component, pageProps }) {
  return (
    <RootLayout>
      <Component {...pageProps} />
      <ToastContainer />
    </RootLayout>
  );
}
