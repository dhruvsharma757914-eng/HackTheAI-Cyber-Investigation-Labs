"use client";

import { useMemo, useState } from "react";

interface ArchiveFile {
  path: string;
  name: string;
  folder: string;
  content: string;
  note?: string;
  evidence?: boolean;
}

const FILES: ArchiveFile[] = [
  {
    path: "README.txt",
    name: "README.txt",
    folder: "",
    content: `echo-archive-v3
================

Archived workspace for PROJECT ECHO.

This bucket is retained for historical reference only.
Do not modify. Do not delete.

Owner           : Legacy Engineering
Created         : 3 years ago
Last modified   : 19 months ago
Managed by      : (none)  <- not present in current cloud inventory`,
    note: "Unmanaged resource. No owner, no lifecycle policy.",
  },
  {
    path: "architecture/echo-network.txt",
    name: "echo-network.txt",
    folder: "architecture/",
    content: `PROJECT ECHO LEGACY ARCHITECTURE
================================

  Employee Browser
         |
         v
     Echo Helper
         |
         v
  echo-gateway.vantaris.local
         |
         v
     Echo Runner

Note: this diagram predates the Vantaris Flow migration.`,
    note: "The bucket is a map, not just storage.",
    evidence: true,
  },
  {
    path: "browser/echo-helper-config.json",
    name: "echo-helper-config.json",
    folder: "browser/",
    content: `{
  "gatewayHost": "echo-gateway.vantaris.local",
  "syncIntervalMinutes": 15,
  "telemetry": false,
  "migrationTarget": "vantaris-flow.vantaris.local",
  "packageVersion": "2.4.1"
}`,
    note: "The browser client still points at the legacy gateway.",
    evidence: true,
  },
  {
    path: "automation/webhook-notes.txt",
    name: "webhook-notes.txt",
    folder: "automation/",
    content: `ECHO AUTOMATION HUB — INTEGRATION NOTES
=======================================

Endpoint : POST /api/echo/events
Payload  : { "event": "sync.completed", "project": "echo" }
Auth     : X-Echo-Signature  (HMAC-SHA256)

Open items
----------
TODO: wire signature verification before GA.
TODO: add replay protection.
TODO: remove after Echo migration.`,
    note: "Signature verification was never wired up.",
    evidence: true,
  },
  {
    path: "migration/shutdown-plan.txt",
    name: "shutdown-plan.txt",
    folder: "migration/",
    content: `PROJECT ECHO
DECOMMISSIONING CHECKLIST

Core Application ........ COMPLETE
Database ................ COMPLETE
Compute Resources ....... COMPLETE

Browser Helper .......... PENDING
Gateway DNS ............. PENDING
Automation Webhook ...... PENDING
Archive Storage ......... PENDING

Final verification:
NOT REQUIRED — migration considered complete.`,
    note: "The project wasn't decommissioned. It was declared complete.",
    evidence: true,
  },
];

const ACCESS_LOG = [
  { when: "2023-04-02 11:14:07", who: "legacy-eng@vantaris.local", op: "PUT ", status: "200 OK" },
  { when: "2023-04-02 11:22:41", who: "legacy-eng@vantaris.local", op: "PUT ", status: "200 OK" },
  { when: "2024-11-13 02:41:55", who: "(anonymous)", op: "GET ", status: "200 OK", flag: "19 months after retirement" },
  { when: "2026-09-18 02:17:03", who: "(anonymous)", op: "LIST", status: "200 OK", flag: "current incident" },
];

export function CloudArchiveSimulator() {
  const [openFolders, setOpenFolders] = useState<string[]>(["migration/"]);
  const [selected, setSelected] = useState("migration/shutdown-plan.txt");
  const [reviewed, setReviewed] = useState<string[]>([
    "migration/shutdown-plan.txt",
  ]);

  const folders = useMemo(() => {
    const map = new Map<string, ArchiveFile[]>();
    for (const file of FILES) {
      const key = file.folder || "(root)";
      const list = map.get(key) ?? [];
      list.push(file);
      map.set(key, list);
    }
    return [...map.entries()];
  }, []);

  const active = FILES.find((f) => f.path === selected) ?? FILES[0];

  function open(file: ArchiveFile) {
    setSelected(file.path);
    setReviewed((prev) =>
      prev.includes(file.path) ? prev : [...prev, file.path],
    );
  }

  function toggleFolder(key: string) {
    setOpenFolders((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    );
  }

  const evidenceSeen = FILES.filter(
    (f) => f.evidence && reviewed.includes(f.path),
  ).length;
  const evidenceTotal = FILES.filter((f) => f.evidence).length;

  return (
    <div className="space-y-4">
      {/* Resource banner */}
      <div className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-void-600 px-4 py-2.5">
          <span className="panel-title">Cloud resource · build 8827180</span>
          <span className="chip border-signal-amber/40 bg-signal-amber/10 text-signal-amber">
            UNMANAGED
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-px bg-void-600 sm:grid-cols-4">
          {[
            ["Name", "echo-archive-v3"],
            ["Owner", "Legacy Engineering"],
            ["Created", "3 years ago"],
            ["Last modified", "19 months ago"],
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

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Tree */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">/echo/</span>
            <span className="text-[10px] text-slate-600">
              {reviewed.length}/{FILES.length}
            </span>
          </div>
          <ul className="max-h-[380px] overflow-y-auto p-2 text-xs">
            {folders.map(([folder, items]) => {
              const isRoot = folder === "(root)";
              const isOpen = isRoot || openFolders.includes(folder);
              return (
                <li key={folder}>
                  {!isRoot && (
                    <button
                      type="button"
                      onClick={() => toggleFolder(folder)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-slate-400 hover:bg-void-800"
                    >
                      <span className="text-slate-600">{isOpen ? "▾" : "▸"}</span>
                      <span>📁 {folder}</span>
                    </button>
                  )}
                  {isOpen && (
                    <ul className={isRoot ? "" : "ml-4 border-l border-void-700 pl-2"}>
                      {items.map((file) => {
                        const isActive = file.path === selected;
                        const seen = reviewed.includes(file.path);
                        return (
                          <li key={file.path}>
                            <button
                              type="button"
                              onClick={() => open(file)}
                              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition ${
                                isActive
                                  ? "bg-signal-cyan/10 text-signal-cyan"
                                  : "text-slate-400 hover:bg-void-800"
                              }`}
                            >
                              <span className="text-slate-600">📄</span>
                              <span className="truncate">{file.name}</span>
                              {seen && (
                                <span className="ml-auto text-[10px] text-signal-green">
                                  ✓
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Viewer */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title truncate">
              /echo/{active.path}
            </span>
            {active.evidence && (
              <span className="chip border-signal-violet/40 bg-signal-violet/10 text-signal-violet">
                EVIDENCE
              </span>
            )}
          </div>
          <pre className="code-block max-h-[320px] overflow-auto rounded-none border-0">
            {active.content}
          </pre>
          {active.note && (
            <div className="border-t border-void-600 px-4 py-2.5 text-[11px] text-slate-500">
              <span className="text-signal-amber">NOTE </span>
              {active.note}
            </div>
          )}
        </div>
      </div>

      {/* Access history */}
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Access history · echo-archive-v3</span>
          <span className="text-[10px] text-slate-600">
            {evidenceSeen}/{evidenceTotal} evidence files recovered
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-void-600 text-[10px] uppercase tracking-[0.16em] text-slate-600">
                <th className="px-4 py-2 font-normal">Timestamp</th>
                <th className="px-4 py-2 font-normal">Principal</th>
                <th className="px-4 py-2 font-normal">Op</th>
                <th className="px-4 py-2 font-normal">Status</th>
                <th className="px-4 py-2 font-normal">Note</th>
              </tr>
            </thead>
            <tbody>
              {ACCESS_LOG.map((row) => (
                <tr key={row.when} className="border-b border-void-800 last:border-0">
                  <td className="whitespace-nowrap px-4 py-2 text-slate-400">
                    {row.when}
                  </td>
                  <td className="px-4 py-2 text-slate-400">{row.who}</td>
                  <td className="px-4 py-2 text-slate-500">{row.op}</td>
                  <td className="px-4 py-2 text-signal-green">{row.status}</td>
                  <td className="px-4 py-2">
                    {row.flag ? (
                      <span className="text-signal-red">◀ {row.flag}</span>
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
