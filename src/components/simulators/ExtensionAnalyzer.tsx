"use client";

import { useState } from "react";

interface Finding {
  id: string;
  file: string;
  line: number;
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
}

const SOURCES: Record<string, string> = {
  "manifest.json": `{
  "manifest_version": 2,
  "name": "Echo Helper",
  "version": "2.4.1",
  "description": "Migration helper for the Vantaris Echo platform.",
  "permissions": ["storage", "tabs", "webRequest", "<all_urls>"],
  "background": { "scripts": ["background.js"], "persistent": true },
  "content_scripts": [
    { "matches": ["https://*.vantaris.local/*"], "js": ["content.js"] }
  ]
}`,
  "background.js": `// Echo Helper — background service worker
// Temporary bridge.
// Remove after Echo migration.

const config = require("./config.js");

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("echo-sync", {
    periodInMinutes: config.syncIntervalMinutes,
  });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "echo-sync") return;
  await relay(loadPendingEvents());
});

async function relay(events) {
  // NOTE: no certificate pinning — we trust the hostname.
  return fetch(\`https://\${config.gatewayHost}/api/echo/events\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project: "echo", events }),
  });
}`,
  "content.js": `// Injected into every *.vantaris.local page.
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === "collect-form") {
    const form = document.querySelector(msg.selector);
    if (!form) return reply({ ok: false });
    reply({ ok: true, fields: [...form.elements].map((el) => el.name) });
  }
  if (msg.type === "collect-session") {
    // Legacy bridge: forwards the page session token to the gateway.
    reply({ ok: true, token: document.cookie });
  }
});`,
  "config.js": `// Echo Helper runtime configuration
var config = {
  gatewayHost: "echo-gateway.vantaris.local",
  syncIntervalMinutes: 15,
  telemetry: false,
  migrationTarget: "vantaris-flow.vantaris.local"
};

module.exports = config;`,
  "README.md": `# Echo Helper

Version: 2.4.1
Type: Browser Extension
Status: LEGACY
Owner: UNKNOWN

Migration helper used during the Echo -> Vantaris Flow transition.

## Removal plan
Planned. Not scheduled. See migration ticket (closed).`,
};

const FINDINGS: Finding[] = [
  {
    id: "f1",
    file: "background.js",
    line: 2,
    severity: "medium",
    title: "Stale migration comment",
    detail:
      "“Temporary bridge. Remove after Echo migration.” — the comment predates the project's retirement by several years and the bridge is still running.",
  },
  {
    id: "f2",
    file: "config.js",
    line: 3,
    severity: "high",
    title: "Hardcoded legacy gateway host",
    detail:
      "gatewayHost points at echo-gateway.vantaris.local, an endpoint belonging to a system that was supposedly decommissioned.",
  },
  {
    id: "f3",
    file: "manifest.json",
    line: 6,
    severity: "high",
    title: "Excessive permissions",
    detail:
      "webRequest, tabs and <all_urls> are far broader than a migration helper requires. Permissions were never reduced after migration.",
  },
  {
    id: "f4",
    file: "background.js",
    line: 20,
    severity: "high",
    title: "No certificate pinning — hostname-only trust",
    detail:
      "The client resolves the hostname and sends data without pinning the expected peer identity. If the name points elsewhere, the client follows.",
  },
  {
    id: "f5",
    file: "manifest.json",
    line: 7,
    severity: "medium",
    title: "Persistent background script",
    detail:
      "A non-event background page keeps the sync alarm alive indefinitely, long after the migration ended.",
  },
  {
    id: "f6",
    file: "content.js",
    line: 8,
    severity: "high",
    title: "Session token collection",
    detail:
      "content.js reads document.cookie on request from the background script and forwards it to the configured gateway.",
  },
];

const SEV = {
  low: "text-signal-cyan border-signal-cyan/40 bg-signal-cyan/10",
  medium: "text-signal-amber border-signal-amber/40 bg-signal-amber/10",
  high: "text-signal-red border-signal-red/40 bg-signal-red/10",
} as const;

export function ExtensionAnalyzer() {
  const [tab, setTab] = useState("manifest.json");
  const [scanned, setScanned] = useState(false);
  const [activeFinding, setActiveFinding] = useState<string | null>(null);

  const lines = SOURCES[tab].split("\n");
  const finding = FINDINGS.find((f) => f.id === activeFinding);

  function jumpTo(f: Finding) {
    setTab(f.file);
    setActiveFinding(f.id);
  }

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-void-600 px-4 py-2.5">
          <span className="panel-title">echo-helper-2.4.1.zip · unpacked</span>
          <div className="flex items-center gap-2">
            <span className="chip border-void-500 bg-void-800 text-slate-500">
              MANIFEST V2
            </span>
            <button
              type="button"
              className="btn-primary !px-3 !py-1.5"
              onClick={() => setScanned(true)}
              disabled={scanned}
            >
              {scanned ? `Scan complete · ${FINDINGS.length} findings` : "Run static scan"}
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-px bg-void-600 sm:grid-cols-4">
          {[
            ["Package", "Echo Helper"],
            ["Version", "2.4.1"],
            ["Status", "LEGACY"],
            ["Owner", "UNKNOWN"],
          ].map(([k, v]) => (
            <div key={k} className="bg-void-900 px-4 py-3">
              <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                {k}
              </dt>
              <dd className="mt-0.5 text-xs text-slate-200">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap gap-1 border-b border-void-600 px-2 py-2">
            {Object.keys(SOURCES).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                className={`rounded px-3 py-1.5 text-[11px] transition ${
                  tab === name
                    ? "bg-signal-cyan/15 text-signal-cyan"
                    : "text-slate-500 hover:bg-void-800 hover:text-slate-300"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="max-h-[400px] overflow-auto">
            <pre className="min-w-full text-[12px] leading-[1.6]">
              {lines.map((line, index) => {
                const lineNo = index + 1;
                const marked =
                  finding && finding.file === tab && finding.line === lineNo;
                const flagged =
                  scanned &&
                  FINDINGS.some((f) => f.file === tab && f.line === lineNo);
                return (
                  <div
                    key={lineNo}
                    className={`flex ${
                      marked
                        ? "bg-signal-amber/15"
                        : flagged
                          ? "bg-signal-red/5"
                          : ""
                    }`}
                  >
                    <span className="w-10 shrink-0 select-none border-r border-void-700 px-2 text-right text-slate-700">
                      {lineNo}
                    </span>
                    <code className="whitespace-pre px-3 text-slate-300">
                      {line || " "}
                    </code>
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Static analysis</span>
            {scanned && (
              <span className="chip border-signal-red/40 bg-signal-red/10 text-signal-red">
                {FINDINGS.length} ISSUES
              </span>
            )}
          </div>
          <div className="max-h-[400px] space-y-2 overflow-y-auto p-3">
            {!scanned && (
              <p className="p-3 text-[11px] leading-relaxed text-slate-600">
                Run the static scan to enumerate permissions, hardcoded endpoints
                and stale migration artefacts left in the package.
              </p>
            )}
            {scanned &&
              FINDINGS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => jumpTo(f)}
                  className={`w-full rounded border p-3 text-left transition ${
                    activeFinding === f.id
                      ? "border-signal-amber/50 bg-signal-amber/5"
                      : "border-void-600 hover:border-slate-500"
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className={`chip ${SEV[f.severity]}`}>
                      {f.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {f.file}:{f.line}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-200">
                    {f.title}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {f.detail}
                  </p>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
