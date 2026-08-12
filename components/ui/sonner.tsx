"use client";

import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#17171a",
          color: "#f4f4f5",
          border: "1px solid #29292d",
          borderRadius: "2px",
          fontSize: "13px",
        },
      }}
    />
  );
}

export { Toaster };
