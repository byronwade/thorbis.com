import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

function requireKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Add an AI provider key to use AI features.")
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type } = body as { type: string }
    requireKey()

    if (type === "summarize") {
      const { subject, from, body: emailBody } = body as {
        subject: string
        from: string
        body: string
      }
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "You are an email assistant. Summarize emails concisely in 2-4 bullet points. Keep it factual and helpful.",
        prompt: `Subject: ${subject}\nFrom: ${from}\n\nEmail body:\n${emailBody}\n\nNow provide a concise 2-4 bullet summary.`,
      })
      return NextResponse.json({ summary: text.trim() })
    }

    if (type === "suggest") {
      const { body: emailBody } = body as { body: string }
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "Generate 3 concise, actionable reply suggestions for the email. Output as a JSON array of strings.",
        prompt: `Email:\n${emailBody}\n\nReturn ONLY JSON array, no extra text.`,
      })
      let suggestions: string[] = []
      try {
        suggestions = JSON.parse(text)
      } catch {
        suggestions = text
          .split("\n")
          .map((s) => s.replace(/^[-*\d\.\s]+/, "").trim())
          .filter(Boolean)
          .slice(0, 3)
      }
      return NextResponse.json({ suggestions })
    }

    if (type === "tasks") {
      const { body: emailBody } = body as { body: string }
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "Extract at most 5 concrete action items from the email. Return JSON array of short imperative tasks.",
        prompt: `Email:\n${emailBody}\n\nReturn ONLY JSON array, no extra text.`,
      })
      let tasks: string[] = []
      try {
        tasks = JSON.parse(text)
      } catch {
        tasks = text
          .split("\n")
          .map((s) => s.replace(/^[-*\d\.\s]+/, "").trim())
          .filter(Boolean)
          .slice(0, 5)
      }
      return NextResponse.json({ tasks })
    }

    if (type === "rewrite") {
      const { style, text: input } = body as { style: "shorten" | "polish" | "friendly"; text: string }
      const instruction =
        style === "shorten"
          ? "Shorten the reply while preserving meaning."
          : style === "friendly"
          ? "Rewrite with a friendly, empathetic tone."
          : "Polish the writing for clarity and professionalism."
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: "You rewrite user-provided replies. Keep formatting and placeholders intact.",
        prompt: `${instruction}\n\n---\n${input}`,
      })
      return NextResponse.json({ text: text.trim() })
    }

    // New: summarize the visible inbox (array of threads)
    if (type === "summarizeInbox") {
      const { threads } = body as {
        threads: { subject: string; from: string; preview: string; labels: string[] }[]
      }
      const list = threads
        .slice(0, 12)
        .map(
          (t, i) =>
            `${i + 1}. ${t.subject} — from ${t.from}. Labels: ${t.labels.join(", ") || "none"}. Preview: ${t.preview}`
        )
        .join("\n")
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "Summarize the inbox into 3-6 bullets including themes, urgency, and suggested next actions. Be terse but useful.",
        prompt: `Threads:\n${list}\n\nProvide 3-6 bullets summarizing what matters and what to do next.`,
      })
      return NextResponse.json({ summary: text.trim() })
    }

    // New: natural-language smart filter → structured filters
    if (type === "smartFilter") {
      const { query } = body as { query: string }
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "You convert natural language into an object with keys {filter, assignFilter, labelFilter, query}. filter in ['all','unread','starred']; assignFilter in ['all','unassigned','assignedToMe']; labelFilter a string or null; query is free text. Return ONLY JSON.",
        prompt: `Instruction: Convert the following user intent to JSON.\nUser: "${query}"\n\nAllowed labels example: Orders, Support, Billing, Deployments, Marketing, Priority, Infra.`,
      })
      let parsed: any = null
      try {
        parsed = JSON.parse(text)
      } catch {
        parsed = { filter: "all", assignFilter: "all", labelFilter: null, query }
      }
      return NextResponse.json(parsed)
    }

    // New: classify best labels for a thread (constrained to known labels)
    if (type === "classifyLabels") {
      const { subject, preview, allowed } = body as { subject: string; preview: string; allowed: string[] }
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "Pick 1-3 labels from the allowed list that best match the email. Return ONLY a JSON array of strings from the allowed list.",
        prompt: `Allowed labels: ${allowed.join(", ")}\nEmail: ${subject}\nPreview: ${preview}\nReturn JSON array.`,
      })
      let labels: string[] = []
      try {
        labels = JSON.parse(text)
      } catch {
        labels = []
      }
      // Filter to allowed
      labels = labels.filter((l) => allowed.includes(l))
      return NextResponse.json({ labels })
    }

    // New: suggest an assignee (by role/name) based on email content
    if (type === "suggestAssignee") {
      const { subject, preview, users } = body as {
        subject: string
        preview: string
        users: { id: string; name: string; role?: string }[]
      }
      const roster = users.map((u) => `${u.id}|${u.name}|${u.role ?? ""}`).join("\n")
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "Pick the best assignee from the roster. Consider roles and content. Return ONLY a JSON object {userId} where userId matches an id in roster.",
        prompt: `Roster:\n${roster}\n\nEmail:\n${subject}\n${preview}\n\nReturn ONLY JSON.`,
      })
      let userId: string | null = null
      try {
        const parsed = JSON.parse(text)
        userId = parsed.userId ?? null
      } catch {
        userId = null
      }
      return NextResponse.json({ userId })
    }

    // New: assistant freeform prompt (for right-panel chat)
    if (type === "assistant") {
      const { prompt } = body as { prompt: string }
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "You are a helpful team email assistant. You can summarize threads, propose actions, and draft replies succinctly.",
        prompt,
      })
      return NextResponse.json({ text: text.trim() })
    }

    return NextResponse.json({ error: "Unsupported type" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "AI request failed" }, { status: 500 })
  }
}
