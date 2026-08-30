import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import Script from "next/script";
import { Appbar } from "ui";
import InitUser from "./init";
import InitCourses from "./initCourses";
import { useRouter } from "next/router";
import { adminState, userState } from "store";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith("/admin");
  const isUserRoute = router.pathname.startsWith("/user");

  const role = isAdminRoute ? "admin" : isUserRoute ? "user" : null;

  return (
    <RecoilRoot>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />
      {role && (
        <InitUser
          apiUrl={`/api/${role}/me`}
          role={role === "admin" ? adminState : userState}
        />
      )}

      {isUserRoute && <InitCourses />}
      {role && <Appbar role={role} />}
      <Component {...pageProps} />
    </RecoilRoot>
  );
}
