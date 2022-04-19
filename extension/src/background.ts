import { runtime, tabs, webRequest, WebRequest } from "webextension-polyfill";

const prefix = "http://localhost:3000/room/";

runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

tabs.onUpdated.addListener(async (tabId, _, __) => {
  return await tabs.sendMessage(tabId, {
    type: "success",
    payload: {},
  });
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
      return { cancel: false };
    }

    return {
      redirectUrl: prefix + "?url=" + details.url,
    };
  },
  filters,
  ["blocking"]
);
