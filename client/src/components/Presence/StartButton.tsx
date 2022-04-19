import React from "react";

export default function StartButton(props: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button className="" disabled={props.disabled} onClick={props.onClick}>
      Start
    </button>
  );
}
