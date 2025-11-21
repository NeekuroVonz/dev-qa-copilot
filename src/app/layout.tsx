import type { Metadata } from "next";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";
import { AppProviders } from "./providers";
import React from "react";

export const metadata: Metadata = {
  title: "Dev & QA CoPilot",
  description: "AI assistant for developers and QA teams",
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <body>
    <AppProviders>{children}</AppProviders>
    </body>
    </html>
  );
}
