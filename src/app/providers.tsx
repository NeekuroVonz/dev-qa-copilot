"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import React from "react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      defaultColorScheme="dark"
      theme={{
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        primaryColor: "blue",
      }}
    >
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}
