"use client";

import { Tabs } from "@mantine/core";
import { AppShell } from "@/components/layout/AppShell";
import { ExplainTab } from "@/components/explain/ExplainTab";
import { TestCasesTab } from "@/components/testcases/TestCasesTab";
import { EmailHelperTab } from "@/components/email/EmailHelperTab";

export default function HomePage() {
  return (
    <AppShell>
      <Tabs defaultValue="explain">
        <Tabs.List>
          <Tabs.Tab value="explain">Explain &amp; Fix</Tabs.Tab>
          <Tabs.Tab value="testcases">Test Cases</Tabs.Tab>
          <Tabs.Tab value="email">Email Helper</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="explain" pt="md">
          <ExplainTab />
        </Tabs.Panel>

        <Tabs.Panel value="testcases" pt="md">
          <TestCasesTab />
        </Tabs.Panel>

        <Tabs.Panel value="email" pt="md">
          <EmailHelperTab />
        </Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}
