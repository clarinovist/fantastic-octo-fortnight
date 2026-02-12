/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { useReducer } from "react";

interface Props {
  homepage:
    | "btnframe"
    | "btn-hover"
    | "btnyellow"
    | "btn"
    | "btnframe-hover"
    | "btnyellow-hover";
  className: any;
  hasBookingButton?: boolean;
  text: string;
  divClassName?: any;
}

export const Homepage = ({
  homepage,
  className,
  hasBookingButton = true,
  text = "BUTTON",
  divClassName,
}: Props): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, {
    homepage: homepage || "btn",
  });

  return (
    <div
      className={`relative ${["btnframe-hover", "btnframe"].includes(state.homepage) ? "border-4 border-solid" : ""} ${state.homepage === "btnframe" ? "border-[#00000040]" : (state.homepage === "btnframe-hover") ? "border-[#7000fe]" : ""} ${["btnframe-hover", "btnframe"].includes(state.homepage) ? "w-[400px]" : "w-[186px]"} ${["btnyellow-hover", "btnyellow"].includes(state.homepage) ? "left-[268px]" : "left-[39px]"} ${["btnframe-hover", "btnframe"].includes(state.homepage) ? "flex" : ""} ${["btnframe-hover", "btnframe"].includes(state.homepage) ? "items-center" : ""} ${["btn-hover", "btnyellow-hover"].includes(state.homepage) ? "top-[120px]" : (state.homepage === "btnframe") ? "top-[219px]" : state.homepage === "btnframe-hover" ? "top-[371px]" : "top-9"} ${["btnframe-hover", "btnframe"].includes(state.homepage) ? "h-[104px]" : "h-10"} ${["btn-hover", "btnframe-hover", "btnframe", "btnyellow-hover"].includes(state.homepage) ? "overflow-hidden" : ""} ${["btn-hover", "btnyellow-hover"].includes(state.homepage) ? "rounded-lg" : (["btnframe-hover", "btnframe"].includes(state.homepage)) ? "rounded-3xl" : ""} ${state.homepage === "btn-hover" ? "bg-white" : (state.homepage === "btnyellow-hover") ? "bg-[#fecb00]" : ""} ${className}`}
      onMouseEnter={() => {
        dispatch("mouse_enter");
      }}
      onMouseLeave={() => {
        dispatch("mouse_leave");
      }}
    >
      {["btn", "btnyellow"].includes(state.homepage) && (
        <>
          <div
            className={`w-[calc(100%_-_8px)] left-1 top-1 h-[calc(100%_-_8px)] rounded-lg absolute ${state.homepage === "btnyellow" ? "bg-[#fecb00]" : "bg-white"}`}
          />

          <>
            {hasBookingButton && (
              <div className="w-full left-0 top-0 h-full rounded-lg absolute" />
            )}
          </>
        </>
      )}

      {["btn-hover", "btnyellow-hover"].includes(state.homepage) && (
        <div className="w-full left-0 top-0 h-full rounded-lg absolute" />
      )}

      {["btn-hover", "btn", "btnyellow-hover", "btnyellow"].includes(
        state.homepage,
      ) && (
        <div
          className={`[font-family:'Lato',Helvetica] w-full px-1 left-0 tracking-[0] text-[9px] sm:text-xs md:text-base top-[50%] -translate-y-1/2 absolute font-extrabold text-center leading-tight ${state.homepage === "btnyellow-hover" ? "text-[#3a0083]" : (state.homepage === "btnyellow") ? "text-[#390083]" : "text-[#7000fe]"} ${divClassName}`}
        >
          {text}
        </div>
      )}

      {["btnframe-hover", "btnframe"].includes(state.homepage) && (
        <div
          className={`[font-family:'Lato',Helvetica] tracking-[0] text-xl flex-1 h-5 font-extrabold text-center leading-5 ${state.homepage === "btnframe-hover" ? "text-[#7000fe]" : "text-[#00000040]"} ${divClassName}`}
        >
          {text}
        </div>
      )}
    </div>
  );
};

function reducer(state: any, action: any) {
  if (state.homepage === "btn") {
    switch (action) {
      case "mouse_enter":
        return {
          homepage: "btn-hover",
        };
    }
  }

  if (state.homepage === "btn-hover") {
    switch (action) {
      case "mouse_leave":
        return {
          homepage: "btn",
        };
    }
  }

  if (state.homepage === "btnyellow") {
    switch (action) {
      case "mouse_enter":
        return {
          homepage: "btnyellow-hover",
        };
    }
  }

  if (state.homepage === "btnyellow-hover") {
    switch (action) {
      case "mouse_leave":
        return {
          homepage: "btnyellow",
        };
    }
  }

  if (state.homepage === "btnframe") {
    switch (action) {
      case "mouse_enter":
        return {
          homepage: "btnframe-hover",
        };
    }
  }

  if (state.homepage === "btnframe-hover") {
    switch (action) {
      case "mouse_leave":
        return {
          homepage: "btnframe",
        };
    }
  }

  return state;
}
