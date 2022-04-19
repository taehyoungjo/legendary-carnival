import React from "react";
import ReactDOM from "react-dom";
import { Runtime, runtime } from "webextension-polyfill";

const cleanup = (container: HTMLDivElement) => () => {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
};

const renderContainer = (
  callback?: (container: HTMLDivElement, cleanup?: () => void) => void
) => {
  const container = document.createElement("div");
  container.setAttribute("id", "still-life-embed-container");
  container.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;background-color:rgba(0,0,0,0.5);`;
  document.body.appendChild(container);

  if (callback) callback(container, cleanup(container));
};

const renderReact = (container: HTMLDivElement, children: JSX.Element) => {
  ReactDOM.render(children, container);
};

const listener = (message: any, _: Runtime.MessageSender) => {
  const { type, payload } = message;
  console.log("Received message", type, payload);

  renderContainer((container, cleanup) => {
    renderReact(
      container,
      <React.StrictMode>
        <div></div>
      </React.StrictMode>
    );
  });
};

runtime.onMessage.addListener(listener);
