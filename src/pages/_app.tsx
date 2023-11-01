import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { ThemeProvider } from "@/providers/theme-provider";

import { Navbar } from "@/components/Navbar";
import "@/styles/globals.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Footer } from "@/components/Footer";
import { VoteResultContextProvider } from "@/context/vote-result";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <VoteResultContextProvider>
          <ToastContainer />
          <Navbar />
          <div className="xl:h-[calc(100vh-137px)]">
            <Component {...pageProps} />
          </div>
          <Footer />
        </VoteResultContextProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
