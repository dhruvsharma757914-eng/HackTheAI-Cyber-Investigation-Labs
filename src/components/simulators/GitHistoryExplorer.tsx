"use client";

import { useState } from "react";
import { Panel } from "@/components/ui";

interface Change {
  path: string;
  status: "A" | "M" | "D";
  diff: string[];
}

interface Commit {
  hash: string;
  short: string;
  message: string;
  author: string;
  date: string;
  changes: Change[];
}

const ENV_FILE = `# Echo Platform — production environment
# NOTE: do not commit. Do not share.

ECHO_GATEWAY_HOST=echo-gateway.vantaris.local
ECHO_WEBHOOK_URL=https://echo-automation-gateway.vantaris.local/api/echo/events
ECHO_WEBHOOK_KEY=TRAINING_ONLY_SECRET
ECHO_RUNNER_IMAGE=registry.vantaris.local/echo/runner:2.4.1
`;

const COMMITS: Commit[] = [
  {
    hash: "9c1f4ab7e3d2a8f1b5c6042e7d91a3f8c2b4e6d0",
    short: "9c1f4ab",
    message: "Initial Echo Gateway",
    author: "N. Reed",
    date: "2021-06-04",
    changes: [
      {
        path: "src/gateway/server.js",
        status: "A",
        diff: [
          "@@ -0,0 +1,12 @@",
          "+const http = require(\"http\");",
          "+const routes = require(\"./routes\");",
          "+",
          "+http.createServer(routes.handle).listen(8080);",
          "+console.log(\"echo-gateway listening on :8080\");",
        ],
      },
      {
        path: "config/echo-production.env",
        status: "A",
        diff: [
          "@@ -0,0 +1,7 @@",
          "+# Echo Platform — production environment",
          "+ECHO_GATEWAY_HOST=echo-gateway.vantaris.local",
          "+ECHO_WEBHOOK_URL=https://echo-automation-gateway.vantaris.local/api/echo/events",
          "+ECHO_WEBHOOK_KEY=TRAINING_ONLY_SECRET",
          "+ECHO_RUNNER_IMAGE=registry.vantaris.local/echo/runner:2.4.1",
        ],
      },
    ],
  },
  {
    hash: "3b8e2d1f7a9c4e6b0d5f8a2c7e1b9d4f6a0c3e5b",
    short: "3b8e2d1",
    message: "Add Echo Helper",
    author: "N. Reed",
    date: "2021-07-19",
    changes: [
      {
        path: "browser/echo-helper/manifest.json",
        status: "A",
        diff: ["@@ -0,0 +1,6 @@", "+{ \"name\": \"Echo Helper\", \"version\": \"2.4.1\" }"],
      },
      {
        path: "browser/echo-helper/config.js",
        status: "A",
        diff: [
          "@@ -0,0 +1,4 @@",
          "+var config = {",
          "+  gatewayHost: \"echo-gateway.vantaris.local\"",
          "+};",
        ],
      },
    ],
  },
  {
    hash: "7d4c9e0a2b6f8d3c1a5e7b9f0d2c4a6e8b1f3d5c",
    short: "7d4c9e0",
    message: "Connect Automation Hub",
    author: "L. Park",
    date: "2021-09-02",
    changes: [
      {
        path: "automation/hub/router.js",
        status: "A",
        diff: [
          "@@ -0,0 +1,8 @@",
          "+router.post(\"/api/echo/events\", (req, res) => {",
          "+  // TODO: verify X-Echo-Signature before GA",
          "+  const { event, project } = req.body;",
          "+  handle(event, project);",
          "+  res.status(202).json({ ok: true });",
          "+});",
        ],
      },
      {
        path: "config/echo-production.env",
        status: "M",
        diff: [
          "@@ -3,0 +4,1 @@",
          "+ECHO_WEBHOOK_KEY=TRAINING_ONLY_SECRET",
        ],
      },
    ],
  },
  {
    hash: "e2a7b3c9d1f5a8e0c4b6d2f7a9e1c3b5d8f0a2e4",
    short: "e2a7b3c",
    message: "Configure Legacy DNS",
    author: "M. Hale",
    date: "2021-10-11",
    changes: [
      {
        path: "infra/dns/echo.tf",
        status: "A",
        diff: [
          "@@ -0,0 +1,5 @@",
          "+resource \"dns_record\" \"echo_gateway\" {",
          "+  name    = \"echo-gateway\"",
          "+  type    = \"A\"",
          "+  records = [\"203.0.113.42\"]",
          "+}",
        ],
      },
    ],
  },
  {
    hash: "b5c1d8f2a4e6b9d3f7a1c5e8b2d6f0a3c7e9b1d4",
    short: "b5c1d8f",
    message: "Add Migration Bridge",
    author: "Z. Malik",
    date: "2021-12-06",
    changes: [
      {
        path: "browser/echo-helper/background.js",
        status: "M",
        diff: [
          "@@ -1,3 +1,4 @@",
          " // Echo Helper — background service worker",
          "+// Temporary bridge.",
          "+// Remove after Echo migration.",
          " const config = require(\"./config.js\");",
        ],
      },
    ],
  },
  {
    hash: "f0a3c7e9b1d4b5c1d8f2a4e6b9d3f7a1c5e8b2d6",
    short: "f0a3c7e",
    message: "Remove Credentials",
    author: "N. Reed",
    date: "2023-04-02",
    changes: [
      {
        path: "config/echo-production.env",
        status: "D",
        diff: [
          "@@ -1,7 +0,0 @@",
          "-# Echo Platform — production environment",
          "-ECHO_GATEWAY_HOST=echo-gateway.vantaris.local",
          "-ECHO_WEBHOOK_URL=https://echo-automation-gateway.vantaris.local/api/echo/events",
          "-ECHO_WEBHOOK_KEY=TRAINING_ONLY_SECRET",
          "-ECHO_RUNNER_IMAGE=registry.vantaris.local/echo/runner:2.4.1",
        ],
      },
    ],
  },
  {
    hash: "a1e5b9d3f7c0a4e8b2d6f1a9c3e7b5d0f4a8c2e6",
    short: "a1e5b9d",
    message: "Decommission Echo",
    author: "M. Chen",
    date: "2023-04-02",
    changes: [
      {
        path: "src/gateway/server.js",
        status: "D",
        diff: ["@@ -1,12 +0,0 @@", "-const http = require(\"http\");"],
      },
      {
        path: "automation/hub/router.js",
        status: "D",
        diff: ["@@ -1,8 +0,0 @@", "-router.post(\"/api/echo/events\", ...)"],
      },
      {
        path: "README.md",
        status: "M",
        diff: [
          "@@ -1,3 +1,3 @@",
          "-# Echo Platform",
          "+# Echo Platform (ARCHIVED)",
          " ",
          "+Project Echo was decommissioned. See migration ticket.",
        ],
      },
    ],
  },
];

const STATUS_STYLE = {
  A: "text-signal-green",
  M: "text-signal-amber",
  D: "text-signal-red",
} as const;

const STATUS_LABEL = { A: "added", M: "modified", D: "deleted" } as const;

export function GitHistoryExplorer() {
  const [selected, setSelected] = useState(COMMITS[COMMITS.length - 1].short);
  const [preview, setPreview] = useState<string | null>(null);

  const commit =
    COMMITS.find((c) => c.short === selected) ?? COMMITS[COMMITS.length - 1];

  const envAppears = COMMITS.filter((c) =>
    c.changes.some((ch) => ch.path === "config/echo-production.env"),
  );

  return (
    <div className="space-y-4">
      <Panel
        title="orion / echo-platform · main"
        right={
          <span className="chip border-signal-red/40 bg-signal-red/10 text-signal-red">
            ARCHIVED
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-px bg-void-600 sm:grid-cols-4">
          {[
            ["Repository", "echo-platform"],
            ["Branch", "main"],
            ["Commits", String(COMMITS.length)],
            ["Status", "ARCHIVED"],
          ].map(([k, v]) => (
            <div key={k} className="bg-void-900 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                {k}
              </div>
              <div className="mt-0.5 text-xs text-slate-200">{v}</div>
            </div>
          ))}
        </div>
        <p className="border-t border-void-600 px-4 py-2.5 text-[11px] text-slate-500">
          The current branch looks clean. Noah's instruction:{" "}
          <span className="text-slate-300">
            “Don't look at what exists now. Look at what existed before.”
          </span>
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Panel title="Commit trail" bodyClassName="p-2">
          <ol className="relative space-y-1">
            {COMMITS.map((c) => {
              const isActive = c.short === selected;
              const hasEnv = c.changes.some(
                (ch) => ch.path === "config/echo-production.env",
              );
              return (
                <li key={c.short}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(c.short);
                      setPreview(null);
                    }}
                    className={`w-full rounded px-3 py-2 text-left transition ${
                      isActive
                        ? "bg-signal-cyan/10 text-signal-cyan"
                        : "text-slate-400 hover:bg-void-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[10px]">
                      <code className="text-slate-600">{c.short}</code>
                      <span className="text-slate-700">{c.date}</span>
                      {hasEnv && (
                        <span className="ml-auto text-signal-violet">⬤</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px]">{c.message}</div>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="px-3 py-2 text-[10px] text-slate-600">
            ⬤ marks commits touching config/echo-production.env
          </p>
        </Panel>

        <div className="space-y-4">
          <Panel title={`Commit ${commit.short}`}>
            <div className="space-y-2 text-[11px]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="chip border-void-500 bg-void-800 text-slate-400">
                  {commit.short}
                </span>
                <span className="text-slate-200">{commit.message}</span>
              </div>
              <div className="text-slate-600">
                {commit.author} · {commit.date}
              </div>
            </div>

            <ul className="mt-4 space-y-1.5">
              {commit.changes.map((change) => (
                <li
                  key={change.path}
                  className="flex flex-wrap items-center gap-2 rounded border border-void-600 px-3 py-2 text-[11px]"
                >
                  <span className={`font-bold ${STATUS_STYLE[change.status]}`}>
                    {change.status}
                  </span>
                  <code className="text-slate-300">{change.path}</code>
                  <span className="text-slate-600">
                    {STATUS_LABEL[change.status]}
                  </span>
                  {change.path === "config/echo-production.env" && (
                    <button
                      type="button"
                      className="btn-ghost ml-auto !px-2 !py-1"
                      onClick={() => setPreview(change.path)}
                    >
                      Show file at this commit
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-3">
              {commit.changes.map((change) => (
                <div key={`${change.path}-diff`}>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    {change.path}
                  </div>
                  <pre className="code-block">
                    {change.diff.map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.startsWith("+")
                            ? "text-signal-green"
                            : line.startsWith("-")
                              ? "text-signal-red"
                              : line.startsWith("@@")
                                ? "text-signal-cyan"
                                : "text-slate-400"
                        }
                      >
                        {line}
                      </div>
                    ))}
                  </pre>
                </div>
              ))}
            </div>
          </Panel>

          {preview && (
            <Panel
              title="Blob · config/echo-production.env"
              right={
                <span className="chip border-signal-red/40 bg-signal-red/10 text-signal-red">
                  RECOVERED FROM HISTORY
                </span>
              }
              bodyClassName="p-0"
            >
              <pre className="code-block rounded-none border-0">
                {ENV_FILE.split("\n").map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.startsWith("ECHO_WEBHOOK_KEY")
                        ? "text-signal-red"
                        : line.startsWith("#")
                          ? "text-slate-600"
                          : "text-slate-300"
                    }
                  >
                    {line || " "}
                  </div>
                ))}
              </pre>
              <p className="border-t border-void-600 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
                ⚠️ TRAINING NOTE — the credential above is synthetic and has no
                real-world access. Deleting a secret from the current branch does
                not erase it from repository history.
              </p>
            </Panel>
          )}

          {!preview && (
            <Panel title="Recovery hint" bodyClassName="p-4">
              <p className="text-[11px] leading-relaxed text-slate-500">
                {envAppears.length} commits touch{" "}
                <code className="text-slate-300">config/echo-production.env</code>.
                Select the commit that removed credentials and open the file at
                that revision to recover its contents.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
