"use client";

import {
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import type { ExplainFixResponse } from "@/types/ai";

export function ExplainTab() {
  const [content, setContent] = useState("");
  const [type, setType] = useState<string | null>("code");
  const [language, setLanguage] = useState<string | null>("vi");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainFixResponse | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim() || !type || !language) {
      notifications.show({
        color: "red",
        title: "Missing input",
        message: "Please fill all required fields.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/explain-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          content,
          language,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        notifications.show({
          color: "red",
          title: "Error",
          message: "Failed to analyze content.",
        });
        return;
      }

      const data = (await res.json()) as ExplainFixResponse;
      setResult(data);
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

  return (
    <Stack>
      <Group grow align="flex-end">
        <Select
          label="Type"
          data={[
            { value: "code", label: "Code" },
            { value: "sql", label: "SQL" },
            { value: "log", label: "Log" },
            { value: "other", label: "Other" },
          ]}
          value={type}
          onChange={setType}
        />
        <Select
          label="Language"
          data={[
            { value: "vi", label: "Vietnamese" },
            { value: "en", label: "English" },
          ]}
          value={language}
          onChange={setLanguage}
        />
      </Group>

      <Textarea
        label="Paste your code / SQL / log"
        minRows={8}
        autosize
        value={content}
        onChange={(e) => setContent(e.currentTarget.value)}
      />

      <Group justify="flex-end">
        <Button onClick={handleAnalyze} loading={loading} disabled={!content}>
          Analyze
        </Button>
      </Group>

      {loading && (
        <Group justify="center">
          <Loader size="sm" />
          <Text size="sm">Analyzing...</Text>
        </Group>
      )}

      {result && (
        <Paper withBorder p="md" radius="md">
          <Stack gap="xs">
            <Text fw={500}>Explanation</Text>
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {result.explanation}
            </Text>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
