"use client";

import {
  Button,
  Checkbox,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import type { TestCaseItem, TestCaseResponse } from "@/types/ai";

export function TestCasesTab() {
  const [requirement, setRequirement] = useState("");
  const [language, setLanguage] = useState<string | null>("vi");
  const [includeBoundary, setIncludeBoundary] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestCaseItem[]>([]);
  const clipboard = useClipboard({ timeout: 2000 });

  const handleGenerate = async () => {
    if (!requirement.trim() || !language) {
      notifications.show({
        color: "red",
        title: "Missing input",
        message: "Requirement & language are required.",
      });
      return;
    }

    setLoading(true);
    setResult([]);

    try {
      const res = await fetch("/api/testcases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirement,
          language,
          includeBoundary,
        }),
      });

      if (!res.ok) {
        console.error(await res.text());
        notifications.show({
          color: "red",
          title: "Error",
          message: "Failed to generate test cases.",
        });
        return;
      }

      const data = (await res.json()) as TestCaseResponse;
      setResult(data.testCases ?? []);
    } catch (err) {
      console.error(err);
      notifications.show({
        color: "red",
        title: "Network error",
        message: "Unable to call API.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!result.length) return;
    const lines = [
      "| ID | Title | Steps | Expected | Priority |",
      "|----|-------|-------|----------|----------|",
      ...result.map(
        (tc) =>
          `| ${tc.id} | ${tc.title} | ${tc.steps.replace(/\n/g, "<br/>")} | ${tc.expected.replace(/\n/g, "<br/>")} | ${tc.priority} |`,
      ),
    ];
    clipboard.copy(lines.join("\n"));
    notifications.show({
      color: "green",
      title: "Copied",
      message: "Test cases copied as Markdown table.",
    });
  };

  return (
    <Stack>
      <Group grow align="flex-end">
        <Select
          label="Language"
          data={[
            { value: "vi", label: "Vietnamese" },
            { value: "en", label: "English" },
          ]}
          value={language}
          onChange={setLanguage}
        />
        <Checkbox
          label="Include boundary & negative cases"
          checked={includeBoundary}
          onChange={(e) => setIncludeBoundary(e.currentTarget.checked)}
          mt="lg"
        />
      </Group>

      <Textarea
        label="Requirement / Ticket description"
        minRows={8}
        autosize
        value={requirement}
        onChange={(e) => setRequirement(e.currentTarget.value)}
      />

      <Group justify="space-between">
        <Button onClick={handleGenerate} loading={loading} disabled={!requirement}>
          Generate Test Cases
        </Button>
        <Button
          variant="light"
          onClick={handleCopyMarkdown}
          disabled={!result.length}
        >
          Copy as Markdown
        </Button>
      </Group>

      {loading && (
        <Group justify="center">
          <Loader size="sm" />
          <Text size="sm">Generating test cases...</Text>
        </Group>
      )}

      {result.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Steps</Table.Th>
                <Table.Th>Expected</Table.Th>
                <Table.Th>Priority</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {result.map((tc) => (
                <Table.Tr key={tc.id}>
                  <Table.Td>{tc.id}</Table.Td>
                  <Table.Td>{tc.title}</Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {tc.steps}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {tc.expected}
                    </Text>
                  </Table.Td>
                  <Table.Td>{tc.priority}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}
