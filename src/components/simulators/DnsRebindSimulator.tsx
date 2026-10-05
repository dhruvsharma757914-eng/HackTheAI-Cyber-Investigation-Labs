"use client";

import { useState } from "react";
import { Panel } from "@/components/ui";

const HOSTNAME = "echo-gateway.vantaris.local";

const ANSWERS = [
  { ip: "203.0.113.42", ttl: 30, label: "initial answer · expected service" },
  { ip: "192.0.2.42", ttl: 300, label: "second answer · unexpected service" },
];

interface Lookup {
  n: number;
  host: string;
  ip: string;
  ttl: number;
  label: string;
}

interface Probe {
  ip: string;
  banner: string;
  lines: string[];
  tone: "expected" | "unknown";
}

const PROBES: Record<string, Probe> = {
  "203.0.113.42": {
    ip: "203.0.113.42",
    banner: "NO SERVICE",
    lines: [
      "Connection refused on :443",
      "The original Echo Gateway was decommissioned — nothing is listening.",
    ],
    tone: "expected",
  },
  "192.0.2.42": {
    ip: "192.0.2.42",
    banner: "ECHO AUTOMATION GATEWAY",
    lines: [
      "╔══════════════════════════════════╗",
      "║      ECHO AUTOMATION GATEWAY     ║",
      "╠══════════════════════════════════╣",
      "║ STATUS:  ONLINE                  ║",
      "║ PROJECT: ECHO                    ║",
      "╚══════════════════════════════════╝",
      "TLS certificate issued to a legacy internal CA.",
    ],
    tone: "unknown",
  },
};

export function DnsRebindSimulator() {
  const [lookups, setLookups] = useState<Lookup[]>([]);
  const [probed, setProbed] = useState<Record<string, true>>({});
  const [busy, setBusy] = useState(false);

  const uniqueIps = [...new Set(lookups.map((l) => l.ip))];
  const anomaly = uniqueIps.length > 1;

  function resolve() {
    setBusy(true);
    const index = lookups.length % ANSWERS.length;
    const answer = ANSWERS[index];
    window.setTimeout(() => {
      setLookups((prev) => [
        ...prev,
        {
          n: prev.length + 1,
          host: HOSTNAME,
          ip: answer.ip,
          ttl: answer.ttl,
          label: answer.label,
        },
      ]);
      setBusy(false);
    }, 320);
  }

  function probe(ip: string) {
    setProbed((prev) => ({ ...prev, [ip]: true }));
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Controlled DNS resolver · training range"
        right={
          <button
            type="button"
            className="btn-primary !px-3 !py-1.5"
            onClick={resolve}
            disabled={busy}
          >
            {busy ? "Querying..." : "Resolve hostname"}
          </button>
        }
        bodyClassName="p-0"
      >
        <div className="border-b border-void-600 bg-void-950/80 px-4 py-3 text-[12px]">
          <span className="text-slate-600">$ </span>
          <span className="text-signal-cyan">dig</span>{" "}
          <span className="text-slate-300">{HOSTNAME}</span>{" "}
          <span className="text-slate-600">A +short</span>
        </div>

        <div className="min-h-[92px] bg-void-950/60 p-4 text-[12px] leading-relaxed">
          {lookups.length === 0 ? (
            <p className="text-slate-600">
              Resolve the hostname to populate the answer history.
            </p>
          ) : (
            <ul className="space-y-1">
              {lookups.map((l) => (
                <li key={l.n} className="flex flex-wrap items-center gap-3">
                  <span className="text-slate-700">#{l.n}</span>
                  <span className="text-slate-500">{l.host}</span>
                  <span className="text-slate-700">→</span>
                  <span
                    className={
                      l.ip === ANSWERS[0].ip
                        ? "text-signal-green"
                        : "text-signal-amber"
                    }
                  >
                    {l.ip}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    ttl={l.ttl}s · {l.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="DNS observation"
          right={
            anomaly ? (
              <span className="chip border-signal-red/40 bg-signal-red/10 text-signal-red">
                ANOMALY DETECTED
              </span>
            ) : (
              <span className="chip border-void-500 bg-void-800 text-slate-600">
                AWAITING DATA
              </span>
            )
          }
        >
          <dl className="space-y-0 text-[12px]">
            <div className="flex items-baseline justify-between border-b border-void-700 py-2">
              <dt className="text-slate-600">HOSTNAME</dt>
              <dd className="text-slate-300">{HOSTNAME}</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-void-700 py-2">
              <dt className="text-slate-600">INITIAL DESTINATION</dt>
              <dd className="text-signal-green">
                {lookups[0]?.ip ?? "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-void-700 py-2">
              <dt className="text-slate-600">SECOND DESTINATION</dt>
              <dd className="text-signal-amber">
                {lookups[1]?.ip ?? "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between py-2">
              <dt className="text-slate-600">RESULT</dt>
              <dd
                className={
                  anomaly ? "font-bold text-signal-red" : "text-slate-500"
                }
              >
                {anomaly ? "DESTINATION CHANGED" : "INCONCLUSIVE"}
              </dd>
            </div>
          </dl>

          <p className="mt-3 border-t border-void-700 pt-3 text-[11px] leading-relaxed text-slate-500">
            Both addresses are synthetic training addresses (RFC 5737
            documentation ranges). The behaviour, not the address, is the finding.
          </p>
        </Panel>

        <Panel title="Trust chain">
          <ol className="space-y-0 text-[11px]">
            {[
              ["TRUSTED HOSTNAME", "echo-gateway.vantaris.local"],
              ["INITIAL DNS ANSWER", lookups[0]?.ip ?? "—"],
              ["EXPECTED SERVICE", "Legacy Echo Gateway"],
              ["DNS CHANGES", anomaly ? "answer mutated" : "not observed"],
              ["SAME HOSTNAME", "unchanged"],
              ["DIFFERENT DESTINATION", lookups[1]?.ip ?? "—"],
            ].map(([label, value], i, arr) => (
              <li
                key={label}
                className={`flex items-baseline justify-between py-2 ${
                  i < arr.length - 1 ? "border-b border-void-700" : ""
                }`}
              >
                <span className="text-slate-600">{label}</span>
                <span
                  className={
                    label === "DIFFERENT DESTINATION" && anomaly
                      ? "text-signal-red"
                      : "text-slate-300"
                  }
                >
                  {value}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel
        title="Destination probe"
        right={
          <span className="text-[10px] text-slate-600">
            {Object.keys(probed).length}/{uniqueIps.length || ANSWERS.length} probed
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {ANSWERS.map((answer) => {
            const observed = uniqueIps.includes(answer.ip);
            const probeInfo = PROBES[answer.ip];
            const done = probed[answer.ip];
            return (
              <div
                key={answer.ip}
                className={`rounded border p-3 transition ${
                  observed ? "border-void-500" : "border-void-700 opacity-50"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-200">{answer.ip}</span>
                  <button
                    type="button"
                    className="btn-ghost !px-3 !py-1"
                    disabled={!observed || done}
                    onClick={() => probe(answer.ip)}
                  >
                    {done ? "Probed" : "Probe"}
                  </button>
                </div>

                {done && probeInfo ? (
                  <div
                    className={`rounded border p-3 text-[11px] leading-relaxed ${
                      probeInfo.tone === "unknown"
                        ? "border-signal-red/40 bg-signal-red/5"
                        : "border-void-600 bg-void-950/60"
                    }`}
                  >
                    <div
                      className={`mb-1.5 font-bold tracking-wider ${
                        probeInfo.tone === "unknown"
                          ? "text-signal-red"
                          : "text-slate-400"
                      }`}
                    >
                      {probeInfo.banner}
                    </div>
                    {probeInfo.lines.map((line) => (
                      <div key={line} className="whitespace-pre text-slate-400">
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600">
                    {observed
                      ? "Destination observed in the answer history. Probe to identify the service."
                      : "Not yet returned by the resolver."}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {probed["192.0.2.42"] && (
          <div className="mt-4 rounded border border-signal-red/40 bg-signal-red/5 p-3 text-[11px] leading-relaxed text-slate-300">
            <span className="font-bold text-signal-red">SYSTEM STILL ONLINE. </span>
            The system that was supposed to be gone is responding on the second
            destination. The gateway name never changed — only where it pointed.
          </div>
        )}
      </Panel>
    </div>
  );
}
