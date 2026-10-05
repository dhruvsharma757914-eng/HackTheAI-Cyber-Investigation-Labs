"use client";

import { useState } from "react";
import { Panel } from "@/components/ui";

const INSPECT = `{
  "Id": "9f2c41ab77e0d3c8b5a61f04e7d92c13ab45ef80",
  "Name": "/orion-worker-17",
  "State": {
    "Status": "running",
    "StartedAt": "2026-09-18T03:11:42Z"
  },
  "Config": {
    "Image": "registry.aurelia-labs.example/orion/worker:1.8.0",
    "User": "root",
    "Env": ["ORION_ENV=production", "ORION_QUEUE=deployments"]
  },
  "HostConfig": {
    "Privileged": true,
    "PidMode": "host",
    "NetworkMode": "bridge",
    "ReadonlyRootfs": false,
    "CapAdd": ["SYS_ADMIN", "NET_ADMIN"],
    "SecurityOpt": [],
    "Binds": ["/var/log/orion:/host-logs:rw"]
  },
  "Mounts": [
    {
      "Source": "/var/log/orion",
      "Destination": "/host-logs",
      "Mode": "rw",
      "RW": true
    }
  ]
}`;

interface Flagged {
  key: string;
  value: string;
  severity: "high" | "critical";
  detail: string;
}

const FLAGS: Flagged[] = [
  {
    key: "HostConfig.Privileged",
    value: "true",
    severity: "critical",
    detail:
      "Privileged containers receive all Linux capabilities and access to all host devices. The kernel security boundary is effectively removed.",
  },
  {
    key: "HostConfig.CapAdd",
    value: '["SYS_ADMIN", "NET_ADMIN"]',
    severity: "critical",
    detail:
      "SYS_ADMIN permits mount() and ptrace() — the classic container-escape primitive. NET_ADMIN allows host network reconfiguration.",
  },
  {
    key: "HostConfig.PidMode",
    value: '"host"',
    severity: "high",
    detail:
      "The container shares the host PID namespace and can observe and signal host processes.",
  },
  {
    key: "HostConfig.Binds",
    value: '["/var/log/orion:/host-logs:rw"]',
    severity: "critical",
    detail:
      "A host log directory is mounted read-write. The workload can write directly into host-side log evidence.",
  },
  {
    key: "HostConfig.ReadonlyRootfs",
    value: "false",
    severity: "high",
    detail:
      "The root filesystem is writable, so tooling can be installed inside the container at runtime.",
  },
  {
    key: "Config.User",
    value: '"root"',
    severity: "high",
    detail:
      "The workload runs as UID 0 inside the container rather than an unprivileged user.",
  },
];

const HOST_LOG = `[03:11:42] container started
[03:12:01] privileged operation detected
[03:12:09] host interaction detected
[03:12:14] authentication event referenced`;

const DASHBOARD = [
  ["container started", "03:11:42", "03:14:07"],
  ["privileged operation", "03:12:01", "03:14:29"],
  ["host interaction", "03:12:09", "03:14:36"],
  ["authentication event", "03:12:14", "03:14:41"],
];

const SEV_CHIP = {
  high: "border-signal-amber/40 bg-signal-amber/10 text-signal-amber",
  critical: "border-signal-red/40 bg-signal-red/10 text-signal-red",
} as const;

export function ContainerInspector() {
  const [scanned, setScanned] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);

  const highlight = (line: string) => {
    if (!scanned) return false;
    if (line.includes('"Privileged": true')) return true;
    if (line.includes('"PidMode": "host"')) return true;
    if (line.includes("SYS_ADMIN")) return true;
    if (line.includes("/var/log/orion")) return true;
    if (line.includes('"User": "root"')) return true;
    if (line.includes('"ReadonlyRootfs": false')) return true;
    return false;
  };

  return (
    <div className="space-y-4">
      <Panel
        title="orion-worker-17 · docker runtime"
        right={
          <div className="flex items-center gap-2">
            <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
              RUNNING
            </span>
            <button
              type="button"
              className="btn-primary !px-3 !py-1.5"
              onClick={() => setScanned(true)}
              disabled={scanned}
            >
              {scanned ? `${FLAGS.length} findings` : "Audit isolation"}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-px bg-void-600 sm:grid-cols-4">
          {[
            ["Container", "orion-worker-17"],
            ["Runtime", "Docker"],
            ["Application", "Orion Worker"],
            ["Environment", "TRAINING LAB"],
          ].map(([k, v]) => (
            <div key={k} className="bg-void-900 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                {k}
              </div>
              <div className="mt-0.5 text-xs text-slate-200">{v}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Panel title="$ docker inspect orion-worker-17" bodyClassName="p-0">
          <pre className="code-block max-h-[420px] overflow-auto rounded-none border-0 bg-void-950/80">
            {INSPECT.split("\n").map((line, i) => (
              <div
                key={i}
                className={
                  highlight(line)
                    ? "bg-signal-red/10 text-signal-red"
                    : "text-slate-400"
                }
              >
                {line || " "}
              </div>
            ))}
          </pre>
        </Panel>

        <Panel title="Isolation boundary">
          {!scanned ? (
            <p className="text-[11px] leading-relaxed text-slate-600">
              Run the isolation audit to flag every runtime setting that weakens
              the container boundary. The question is not simply how to escape —
              it is <span className="text-slate-400">why this container was
              capable of crossing its intended security boundary</span>.
            </p>
          ) : (
            <ul className="max-h-[420px] space-y-2 overflow-y-auto">
              {FLAGS.map((flag) => (
                <li key={flag.key}>
                  <button
                    type="button"
                    onClick={() =>
                      setActive(active === flag.key ? null : flag.key)
                    }
                    className={`w-full rounded border p-3 text-left transition ${
                      active === flag.key
                        ? "border-signal-amber/50 bg-signal-amber/5"
                        : "border-void-600 hover:border-slate-500"
                    }`}
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className={`chip ${SEV_CHIP[flag.severity]}`}>
                        {flag.severity.toUpperCase()}
                      </span>
                      <code className="truncate text-[10px] text-slate-500">
                        {flag.key}
                      </code>
                    </div>
                    <code className="block truncate text-[11px] text-signal-red">
                      {flag.value}
                    </code>
                    {active === flag.key && (
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                        {flag.detail}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title="Host-side artifact · /var/log/orion/runtime-events.log"
        right={
          <button
            type="button"
            className="btn-ghost !px-3 !py-1.5"
            onClick={() => setLogOpen((v) => !v)}
          >
            {logOpen ? "Hide artifact" : "Read artifact"}
          </button>
        }
      >
        {!logOpen ? (
          <p className="text-[11px] text-slate-600">
            While containerising the inspection, this host-side file appeared. It
            is not produced by the application and Jonas does not recognise it.
          </p>
        ) : (
          <div className="space-y-4">
            <pre className="code-block">{HOST_LOG}</pre>

            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-slate-600">
                Timeline comparison
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-void-600 text-[10px] uppercase tracking-[0.16em] text-slate-600">
                      <th className="py-2 pr-4 font-normal">Event</th>
                      <th className="py-2 pr-4 font-normal">Host artifact</th>
                      <th className="py-2 pr-4 font-normal">Main dashboard</th>
                      <th className="py-2 font-normal">Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DASHBOARD.map(([event, host, dash]) => (
                      <tr key={event} className="border-b border-void-800 last:border-0">
                        <td className="py-2 pr-4 text-slate-300">{event}</td>
                        <td className="py-2 pr-4 text-signal-cyan">{host}</td>
                        <td className="py-2 pr-4 text-slate-400">{dash}</td>
                        <td className="py-2 text-signal-red">+2m25s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                Jonas: <span className="text-slate-300">“That timestamp doesn't
                match what I see in the main dashboard.”</span> A consistent
                2m25s offset across every event points at the logging pipeline
                itself — which is the next lead.
              </p>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
