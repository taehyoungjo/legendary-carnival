import { storage } from "webextension-polyfill";
import { useEffect, useState } from "react";

export function App() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    storage.local.get("enabled").then(({ enabled }) => {
      if (enabled === "true") {
        setEnabled(true);
      } else if (enabled === "false") {
        setEnabled(false);
      } else {
        setEnabled(false);
      }
    });
  }, []);

  return (
    <div className="px-6 py-4 flex flex-col space-y-3 justify-center items-center">
      <h1 className="text-md text-blue-500">Still Life</h1>
      <button
        className="text-sm text-blue-400 px-4 py-2 rounded-md hover:bg-blue-100 hover:text-blue-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out bg-white border border-blue-500"
        onClick={() => {
          // runtime.sendMessage({
          //   type: "toggle",
          //   payload: {},
          // });
          storage.local
            .set({
              enabled: !enabled ? "true" : "false",
            })
            .then(() => {
              setEnabled(!enabled);
            });
        }}
        disabled={enabled === null}
      >
        {enabled === null ? "Loading..." : enabled ? "Disable" : "Enable"}
      </button>
    </div>
  );
}
