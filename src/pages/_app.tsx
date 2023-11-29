import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { ThemeProvider } from "@/providers/theme-provider";

import { Navbar } from "@/components/Navbar";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <ToastContainer />
        <Toaster />
        <Navbar />
        <Head>
          <title>GEBRA PLANNING </title>
          <meta name="description" content="Vote no peso da sua issue" />
          <link rel="icon" href="/gebra-icon.svg" />
        </Head>
        <div className="xl:h-[calc(100vh-89px)]">
          <Component {...pageProps} />
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
