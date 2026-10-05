"use client";

import { useState } from "react";
import { Panel } from "@/components/ui";

interface LogLine {
  key: string;
  text: string;
  changed?: boolean;
  injected?: boolean;
}

const SYSTEM_LOG: LogLine[] = [
  { key: "l1", text: "[03:11:42] Authentication attempt       user=svc-deploy-orion src=10.20.4.11" },
  { key: "l2", text: "[03:11:44] Authentication successful    user=svc-deploy-orion" },
  { key: "l3", text: "[03:11:47] Deployment console accessed  user=svc-deploy-orion", changed: true },
  {
    key: "l4x",
    text: "[03:11:53] session opened  host=legacy-console.aurelia-labs.example",
    injected: true,
  },
  { key: "l5", text: "[03:12:01] Container started            container=orion-worker-17", changed: true },
];

const ARCHIVE_LOG: LogLine[] = [
  { key: "l1", text: "[03:11:42] Authentication attempt       user=svc-deploy-orion src=10.20.4.11" },
  { key: "l2", text: "[03:11:44] Authentication successful    user=svc-deploy-orion" },
  { key: "l3", text: "[03:15:29] Deployment console accessed  user=svc-deploy-orion", changed: true },
  { key: "l5", text: "[03:16:01] Container started            container=orion-worker-17", changed: true },
];

const POISONED_ENTRY = `raw = '{"user":"svc-deploy-orion","action":"session.open"}'

logger.info("session opened host=" + raw_payload.host)

# persisted as:
[03:11:53] session opened  host=legacy-console.aurelia-labs.example`;

export function LogDiff() {
  const [diffOnly, setDiffOnly] = useState(false);
  const [inspect, setInspect] = useState(false);

  const systemLines = diffOnly
    ? SYSTEM_LOG.filter((l) => l.changed || l.injected)
    : SYSTEM_LOG;
  const archiveLines = diffOnly
    ? ARCHIVE_LOG.filter((l) => l.changed)
    : ARCHIVE_LOG;

  return (
    <div className="space-y-4">
      <Panel
        title="Evidence comparison · case NF-219"
        right={
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={diffOnly}
              onChange={(e) => setDiffOnly(e.target.checked)}
              className="h-3.5 w-3.5 accent-emerald-400"
            />
            Differences only
          </label>
        }
      >
        <p className="text-[11px] leading-relaxed text-slate-500">
          Priya provides two versions of the same authentication window: the live
          system log, which application processes can write to, and a protected
          archival copy taken by the log shipper before the workload could reach
          it.
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Live system log"
          right={
            <span className="chip border-signal-amber/40 bg-signal-amber/10 text-signal-amber">
              UNTRUSTED
            </span>
          }
          bodyClassName="p-0"
        >
          <pre className="code-block max-h-[320px] overflow-auto rounded-none border-0 bg-void-950/80 text-[11px]">
            {systemLines.map((line) => (
              <div
                key={line.key}
                onClick={() => line.injected && setInspect(true)}
                className={`px-3 py-1 ${
                  line.injected
                    ? "cursor-pointer bg-signal-red/10 text-signal-red"
                    : line.changed
                      ? "bg-signal-amber/5 text-signal-amber"
                      : "text-slate-400"
                }`}
              >
                {line.text}
                {line.injected && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider">
                    ◀ injected · click to inspect
                  </span>
                )}
              </div>
            ))}
          </pre>
        </Panel>

        <Panel
          title="Archived copy"
          right={
            <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
              PROTECTED
            </span>
          }
          bodyClassName="p-0"
        >
          <pre className="code-block max-h-[320px] overflow-auto rounded-none border-0 bg-void-950/80 text-[11px]">
            {archiveLines.map((line) => (
              <div
                key={line.key}
                className={`px-3 py-1 ${
                  line.changed ? "bg-signal-amber/5 text-signal-amber" : "text-slate-400"
                }`}
              >
                {line.text}
              </div>
            ))}
          </pre>
        </Panel>
      </div>

      <Panel title="Timestamp drift">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-void-600 text-[10px] uppercase tracking-[0.16em] text-slate-600">
                <th className="py-2 pr-4 font-normal">Event</th>
                <th className="py-2 pr-4 font-normal">Live system log</th>
                <th className="py-2 pr-4 font-normal">Archived copy</th>
                <th className="py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-void-800">
                <td className="py-2 pr-4 text-slate-300">Authentication attempt</td>
                <td className="py-2 pr-4 text-slate-400">03:11:42</td>
                <td className="py-2 pr-4 text-slate-400">03:11:42</td>
                <td className="py-2 text-signal-green">match</td>
              </tr>
              <tr className="border-b border-void-800">
                <td className="py-2 pr-4 text-slate-300">Authentication successful</td>
                <td className="py-2 pr-4 text-slate-400">03:11:44</td>
                <td className="py-2 pr-4 text-slate-400">03:11:44</td>
                <td className="py-2 text-signal-green">match</td>
              </tr>
              <tr className="border-b border-void-800">
                <td className="py-2 pr-4 text-slate-300">Deployment console accessed</td>
                <td className="py-2 pr-4 text-signal-amber">03:11:47</td>
                <td className="py-2 pr-4 text-signal-amber">03:15:29</td>
                <td className="py-2 text-signal-red">falsified (-3m42s)</td>
              </tr>
              <tr className="border-b border-void-800">
                <td className="py-2 pr-4 text-slate-300">session opened (host=...)</td>
                <td className="py-2 pr-4 text-signal-red">03:11:53</td>
                <td className="py-2 pr-4 text-slate-700">absent</td>
                <td className="py-2 text-signal-red">injected</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-slate-300">Container started</td>
                <td className="py-2 pr-4 text-signal-amber">03:12:01</td>
                <td className="py-2 pr-4 text-signal-amber">03:16:01</td>
                <td className="py-2 text-signal-red">falsified (-4m00s)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      {inspect ? (
        <Panel
          title="Poisoned entry inspector"
          right={
            <span className="chip border-signal-red/40 bg-signal-red/10 text-signal-red">
              UNTRUSTED INPUT
            </span>
          }
        >
          <pre className="code-block text-[11px]">{POISONED_ENTRY}</pre>
          <div className="mt-4 rounded border border-signal-red/40 bg-signal-red/5 p-4 text-[11px] leading-relaxed text-slate-300">
            <span className="font-bold text-signal-red">FINDING. </span>
            Application-generated data — the value of{" "}
            <code className="text-slate-300">raw_payload.host</code> — was
            concatenated straight into the log line. Whoever controls that value
            controls the evidence.
            <p className="mt-3 text-slate-500">
              Priya searches the historical asset inventory for the hostname.
              Nothing — the asset was removed from the inventory months ago. But
              DNS tells a different story.
            </p>
          </div>
        </Panel>
      ) : (
        <Panel title="Entry inspector">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Click the highlighted injected line in the live system log to inspect
            how attacker-controlled input reached the logging pipeline.
          </p>
        </Panel>
      )}
    </div>
  );
}
