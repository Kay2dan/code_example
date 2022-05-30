// import "scripts/wdyr";
import React, { Suspense } from "react";
import {
  AppProps,
  AuthorizationError,
  AuthenticationError,
  ErrorBoundary,
  ErrorComponent,
  ErrorFallbackProps,
  useRouter,
  useQueryErrorResetBoundary,
} from "blitz";
import { RecoilRoot } from "recoil";
// import { ReactQueryDevtools } from "react-query/devtools";
import { Loader, Overlay } from "app/components";

import "app/core/styles/accessibility.css";
import "app/core/styles/animations.css";
import "app/core/styles/components.css";
import "app/core/styles/Footer_Nav.css";
import "app/core/styles/form.css";
import "app/core/styles/help.css";
import "app/core/styles/blog.css";
import "app/core/styles/howItWorks.css";
import "app/core/styles/index.css";
import "app/core/styles/meeting.css";
import "app/core/styles/messenger.css";
import "app/core/styles/team.css";
import "app/core/styles/weeklyReview.css";
import "app/core/styles/inviteSystem.css";
import "app/core/styles/portals.css";

/*******************************
 *******************************
 * This is the main entry poing:
 * Recoil state wrapper is used (like Redux)
 * Each page is wrapped in a Suspense so that
 * the data exclusive to that page is loaded upon navigation
 *******************************
 *******************************/


export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || (page => page);

  return (
    <ErrorBoundary
      FallbackComponent={RootErrorFallback}
      onReset={useQueryErrorResetBoundary().reset}>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <RecoilRoot>
        <div className="__APP__">
          <div className="pageContainer">
            <Suspense fallback={<Loader />}>
              {getLayout(<Component {...pageProps} />)}
            </Suspense>
          </div>
          <Overlay />
        </div>
      </RecoilRoot>
    </ErrorBoundary>
  );
}

// function RootErrorFallback({ error, resetErrorBoundary }) {
function RootErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const router = useRouter();
  if (
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError
  ) {
    router.push("/");
    return <></>;
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error?.message || error?.name}
      />
    );
  }
}
