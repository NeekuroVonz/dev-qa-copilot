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
  Title,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import type { EmailHelperResponse } from "@/types/ai";

export function EmailHelperTab() {
  const [note, setNote] = useState("");
  const [language, setLanguage] = useState<string | null>("vi");
  const [tone, setTone] = useState<string | null>("internal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailHelperResponse | null>(null);
  const clipboard = useClipboard({ timeout: 2000 });

  const handleGenerate = async () => {
    if (!note.trim() || !language || !tone) {
      notifications.show({
        color: "red",
        title: "Missing input",
        message: "Please fill all fields.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/email-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note,
          language,
          tone,
        }),
      });

      if (!res.ok) {
        console.error(await res.text());
        notifications.show({
          color: "red",
          title: "Error",
          message: "Failed to generate email.",
        });
        return;
      }

      const data = (await res.json()) as EmailHelperResponse;
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

  const handleCopyBody = () => {
    if (!result) return;
    clipboard.copy(result.body);
    notifications.show({
      color: "green",
      title: "Copied",
      message: "Email body copied to clipboard.",
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
        <Select
          label="Tone"
          data={[
            { value: "client", label: "Client (formal)" },
            { value: "manager", label: "Manager (formal)" },
            { value: "internal", label: "Internal (friendly)" },
          ]}
          value={tone}
          onChange={setTone}
        />
      </Group>

      <Textarea
        label="Rough notes (VN + EN thoải mái)"
        minRows={6}
        autosize
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
      />

      <Group justify="flex-end">
        <Button onClick={handleGenerate} loading={loading} disabled={!note}>
          Generate Email
        </Button>
      </Group>

      {loading && (
        <Group justify="center">
          <Loader size="sm" />
          <Text size="sm">Generating email...</Text>
        </Group>
      )}

      {result && (
        <Paper withBorder p="md" radius="md">
          <Stack gap="xs">
            <Title order={5}>Subject</Title>
            <Text>{result.subject}</Text>

            <Title order={5} mt="sm">
              Body
            </Title>
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {result.body}
            </Text>

            <Group justify="flex-end" mt="sm">
              <Button variant="light" onClick={handleCopyBody}>
                Copy Body
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
