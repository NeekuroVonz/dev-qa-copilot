"use client";

import { Container, Group, Text, Title } from "@mantine/core";
import React from "react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Dev &amp; QA CoPilot</Title>
          <Text size="sm" c="dimmed">
            AI trợ lý nội bộ cho Developer &amp; QA
          </Text>
        </div>
        <Text size="xs" c="dimmed">
          v0.1 • SQLite + Next.js + Mantine
        </Text>
      </Group>

      {children}
    </Container>
  );
}
