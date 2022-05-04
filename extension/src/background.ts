import { runtime, tabs, webRequest, WebRequest } from "webextension-polyfill";

const prefix = "https://legendary-carnival.vercel.app/";
// const prefix = "http://localhost:3000/";

runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    return await tabs.sendMessage(tabId, {
      type: "success",
      payload: {},
    });
  }
});

function createFilter(): WebRequest.RequestFilter {
  return {
    urls: ["https://*/*", "http://*/*"],
    types: [
      "main_frame",
      "sub_frame",
      "stylesheet",
      "script",
      "image",
      "object",
      "xmlhttprequest",
      "other",
    ],
  };
}

const filters = createFilter();

webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.startsWith(prefix) || details.frameId !== 0) {
      // return { cancel: false };
      console.log(
        "cancelling",
        details.url.startsWith(prefix),
        details.frameId !== 0
      );
      return;
    }

    console.log("redirecting", details.url);
    return {
      redirectUrl: prefix + "room/?url=" + details.url,
    };
  },
  filters,
  ["blocking"]
);
