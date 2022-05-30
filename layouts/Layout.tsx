import { Suspense } from "react";
import { Head, BlitzLayout } from "blitz";
import { Partytown } from "@builder.io/partytown/react";
import { useRecoilValue } from "recoil";
import { Footer, Loader, Navbar } from "app/components";
import { notificationSt } from "app/state";
const faviconHeart = "favicon_heart.svg";
const favicon = "favicon.svg";


/*******************************
 *******************************
 * The wrapper component for each page
 * mainly used for plumbing, I use Heap heapanalytics
 * so this is a good place to load the script
 *******************************
 *******************************/

const Layout: BlitzLayout<{ title?: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => {
  const notifs = useRecoilValue(notificationSt);

  return (
    <div className="layoutWrapper">
      <Head>
        <title>{title || "AimHigh"}</title>
        <meta name="description" content={title} />
        <Partytown debug={true} forward={["heap.push"]} />
        <script
          type="text/partytown"
          async={true}
          dangerouslySetInnerHTML={{
            __html: `window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};
          heap.load("1318347551");`,
          }}
        />
        {notifs.length ? (
          <link rel="icon" href={faviconHeart} />
        ) : (
          <link rel="icon" href={favicon} />
        )}
      </Head>
      <div>
        <Suspense fallback={<Loader />}>
          <Navbar />
        </Suspense>
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
