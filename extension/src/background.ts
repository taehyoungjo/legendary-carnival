import {
  runtime,
  Runtime,
  tabs,
  webRequest,
  WebRequest,
  storage,
} from "webextension-polyfill";

// const prefix = "https://legendary-carnival.vercel.app/";
const prefix = "http://localhost:3000/";
const liveblocks = "https://liveblocks.io/api/";
const daily = "https://c.daily.co/";
const dailyTwo = "https://gs.daily.co/";

let enabled = false;

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

storage.onChanged.addListener(async (changes, _) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue === "true" ? true : false;

    const tabsArr = await tabs.query({ active: true });
    if (tabsArr.length > 0 && enabled === true) {
      const tab = tabsArr[0];

      if (!tab.url) {
        return;
      }

      if (tab.url.startsWith(prefix)) {
        return;
      }

      tabs.create({
        url: prefix + "room/?url=" + tab.url,
      });
    }
  }
});

const runtimeListener = async (
  message: {
    type: string;
    payload: any;
  },
  _: Runtime.MessageSender
) => {
  const { type, payload } = message;
  switch (type) {
    case "toggle":
      console.log("toggle", payload);
      break;
    default:
      return;
  }
};

runtime.onMessage.addListener(runtimeListener);

webRequest.onBeforeRequest.addListener(
  (details) => {
    if (enabled === false) {
      return;
    }

    if (
      details.url.startsWith(prefix) ||
      details.url.startsWith(liveblocks) ||
      details.url.startsWith(daily) ||
      details.url.startsWith(dailyTwo) ||
      details.frameId !== 0
    ) {
      return;
    }

    return {
      redirectUrl: prefix + "room/?url=" + details.url,
    };
  },
  filters,
  ["blocking"]
);
