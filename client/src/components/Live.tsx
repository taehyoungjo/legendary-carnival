import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Presence } from "./Presence";

export function isValidHttpUrl(string: string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export function Live() {
  let query = useQuery();

  const decoded = decodeURIComponent(query.get("url") || "");

  return (
    <div>
      {/* <div className="bg-white w-screen h-6 fixed top-0 left-0">
        Live {decoded}
      </div> */}
      <div className="">
        {isValidHttpUrl(decoded) ? (
          <div>
            {/* <iframe src={decoded} className="h-screen w-screen"></iframe> */}
            <Presence />
          </div>
        ) : (
          <div>Invalid URL</div>
        )}
      </div>
    </div>
  );
}
