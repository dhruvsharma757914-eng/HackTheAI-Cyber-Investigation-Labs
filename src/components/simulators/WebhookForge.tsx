"use client";

import { useState } from "react";
import { Panel } from "@/components/ui";

const ENDPOINT = "https://echo-automation-gateway.vantaris.local/api/echo/events";
const BODY = `{
  "event": "sync.completed",
  "project": "echo"
}`;

type PresetId = "valid" | "missing" | "invalid" | "replay";

interface Preset {
  id: PresetId;
  label: string;
  tone: "green" | "amber" | "red" | "violet";
  signature: string | null;
  timestamp: string;
  nonce: string;
  note: string;
}

const PRESETS: Preset[] = [
  {
    id: "valid",
    label: "Valid signature",
    tone: "green",
    signature: "sha256=8f2c1d90e4b7a35f1c8d6e2b4907af3c",
    timestamp: "2026-09-18T02:17:03Z",
    nonce: "b4e1-77a2",
    note: "A correctly signed request from the expected sender.",
  },
  {
    id: "missing",
    label: "Missing signature",
    tone: "amber",
    signature: null,
    timestamp: "2026-09-18T02:24:11Z",
    nonce: "c9d3-11f8",
    note: "No X-Echo-Signature header at all.",
  },
  {
    id: "invalid",
    label: "Invalid signature",
    tone: "red",
    signature: "sha256=deadbeefcafebabe0000000000000000",
    timestamp: "2026-09-18T02:31:48Z",
    nonce: "aa02-9cdd",
    note: "A deliberately forged signature that cannot validate.",
  },
  {
    id: "replay",
    label: "Replay-style request",
    tone: "violet",
    signature: "sha256=8f2c1d90e4b7a35f1c8d6e2b4907af3c",
    timestamp: "2026-09-17T23:04:52Z",
    nonce: "b4e1-77a2",
    note: "An exact copy of a previously accepted request, re-sent hours later.",
  },
];

const TRACE = [
  { step: "REQUEST RECEIVED", ran: true, detail: "accepted on POST /api/echo/events" },
  { step: "JSON STRUCTURE CHECK", ran: true, detail: "required keys present" },
  {
    step: "SIGNATURE VERIFICATION",
    ran: false,
    detail: "NOT IMPLEMENTED — header is read but never validated",
  },
  {
    step: "TIMESTAMP VALIDATION",
    ran: false,
    detail: "skipped — request age is never checked",
  },
  {
    step: "REPLAY PROTECTION",
    ran: false,
    detail: "skipped — no nonce cache consulted",
  },
  { step: "EVENT VALIDATION", ran: true, detail: "event name accepted" },
  { step: "PROCESS EVENT", ran: true, detail: "handler invoked (simulated)" },
];

const TONE_RING = {
  green: "border-signal-green/50 bg-signal-green/10 text-signal-green",
  amber: "border-signal-amber/50 bg-signal-amber/10 text-signal-amber",
  red: "border-signal-red/50 bg-signal-red/10 text-signal-red",
  violet: "border-signal-violet/50 bg-signal-violet/10 text-signal-violet",
} as const;

export function WebhookForge() {
  const [sent, setSent] = useState<PresetId[]>([]);
  const [active, setActive] = useState<Preset | null>(null);

  function send(preset: Preset) {
    setActive(preset);
    setSent((prev) => (prev.includes(preset.id) ? prev : [...prev, preset.id]));
  }

  const distinct = new Set(sent).size;

  return (
    <div className="space-y-4">
      <Panel
        title="Echo Automation Hub · training instance"
        right={
          <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
            ONLINE
          </span>
        }
      >
        <div className="space-y-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip border-signal-violet/40 bg-signal-violet/10 text-signal-violet">
              POST
            </span>
            <code className="code-block !py-1 break-all text-slate-300">
              {ENDPOINT}
            </code>
          </div>
          <p className="leading-relaxed text-slate-500">
            Lena's question: <span className="text-slate-300">“How does this
            service know that the request actually came from an authorized Echo
            service?”</span> Send each request type and read the control trace.
          </p>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <Panel title="Request forge" bodyClassName="p-3 space-y-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => send(preset)}
              className={`w-full rounded border px-3 py-2.5 text-left text-[11px] transition ${
                active?.id === preset.id
                  ? TONE_RING[preset.tone]
                  : "border-void-600 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              <span className="font-bold">{preset.label}</span>
              <span className="mt-0.5 block text-[10px] text-slate-600">
                {preset.note}
              </span>
            </button>
          ))}
          <p className="pt-1 text-[10px] leading-relaxed text-slate-600">
            {distinct}/4 request types sent. This is a permitted synthetic test —
            no real automation executes.
          </p>
        </Panel>

        <div className="space-y-4">
          <Panel title="Outgoing request" bodyClassName="p-0">
            {!active ? (
              <p className="p-4 text-[11px] text-slate-600">
                Select a request type to forge it.
              </p>
            ) : (
              <>
                <pre className="code-block rounded-none border-0 bg-void-950/80">
{`POST /api/echo/events HTTP/1.1
Host: echo-automation-gateway.vantaris.local
Content-Type: application/json
X-Echo-Timestamp: ${active.timestamp}
X-Echo-Nonce: ${active.nonce}
X-Echo-Signature: ${active.signature ?? "(header absent)"}

${BODY}`}
                </pre>
                <div className="border-t border-void-600 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                      Response
                    </span>
                    <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
                      HTTP 202 ACCEPTED
                    </span>
                  </div>
                  <pre className="code-block mt-3">
{`{
  "event": "sync.completed",
  "signature": "NOT VERIFIED",
  "processing": "SIMULATED"
}`}
                  </pre>
                </div>
              </>
            )}
          </Panel>

          <Panel title="Control trace">
            <ol className="space-y-1.5 text-[11px]">
              {TRACE.map((item) => (
                <li
                  key={item.step}
                  className={`flex flex-wrap items-center gap-2 rounded border px-3 py-2 ${
                    item.ran
                      ? "border-void-600"
                      : "border-signal-red/40 bg-signal-red/5"
                  }`}
                >
                  <span
                    className={
                      item.ran
                        ? "text-signal-green"
                        : "text-signal-red"
                    }
                  >
                    {item.ran ? "✓" : "✗"}
                  </span>
                  <span
                    className={
                      item.ran
                        ? "text-slate-300"
                        : "font-bold text-signal-red"
                    }
                  >
                    {item.step}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-600">
                    {item.detail}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      {distinct >= 4 && (
        <Panel title="Finding recorded">
          <div className="rounded border border-signal-red/40 bg-signal-red/5 p-4 text-[11px] leading-relaxed text-slate-300">
            <div className="mb-2 font-bold tracking-wider text-signal-red">
              WEBHOOK RESULT
            </div>
            <pre className="text-[11px] text-slate-400">
{`HTTP: 202 ACCEPTED
EVENT: sync.completed
SIGNATURE: NOT VERIFIED
PROCESSING: SIMULATED`}
            </pre>
            <p className="mt-3">
              All four request types — including the unsigned, the forged and the
              replayed — were accepted with the same 202. The endpoint validates
              the <em>shape</em> of the request, not the <em>sender</em>.
            </p>
          </div>
        </Panel>
      )}
    </div>
  );
}
