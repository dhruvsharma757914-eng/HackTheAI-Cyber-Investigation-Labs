"use client";

import { useState } from "react";
import { Panel } from "@/components/ui";

const HOST = "legacy-console.aurelia-labs.example";
const CNAME_TARGET = "old-orion-console.training-provider.example";

export function SubdomainTakeover() {
  const [resolved, setResolved] = useState(false);
  const [checked, setChecked] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [busy, setBusy] = useState(false);

  function resolve() {
    setBusy(true);
    window.setTimeout(() => {
      setResolved(true);
      setBusy(false);
    }, 320);
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Aurelia DNS · training resolver"
        right={
          <button
            type="button"
            className="btn-primary !px-3 !py-1.5"
            onClick={resolve}
            disabled={busy || resolved}
          >
            {resolved ? "Resolved" : busy ? "Querying..." : "dig CNAME"}
          </button>
        }
        bodyClassName="p-0"
      >
        <div className="border-b border-void-600 bg-void-950/80 px-4 py-3 text-[12px]">
          <span className="text-slate-600">$ </span>
          <span className="text-signal-cyan">dig</span>{" "}
          <span className="text-slate-300">{HOST}</span>{" "}
          <span className="text-slate-600">CNAME +short</span>
        </div>
        <div className="min-h-[64px] bg-void-950/60 p-4 text-[12px]">
          {resolved ? (
            <div className="space-y-1">
              <div>
                <span className="text-slate-500">{HOST}</span>
                <span className="text-slate-700"> → </span>
                <span className="text-signal-amber">{CNAME_TARGET}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                TTL 300 · record last modified 2021-10-11 · never cleaned up
              </div>
            </div>
          ) : (
            <span className="text-slate-600">
              Resolve the hostname recovered from the manipulated log.
            </span>
          )}
        </div>
      </Panel>

      {resolved && (
        <Panel
          title="Provider claim status"
          right={
            checked ? (
              <span className="chip border-signal-red/40 bg-signal-red/10 text-signal-red">
                UNCLAIMED
              </span>
            ) : null
          }
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setChecked(true)}
              disabled={checked}
            >
              {checked ? "Checked" : "Check if the target service is still owned"}
            </button>
            {checked && (
              <p className="text-[11px] text-slate-400">
                The service once hosted at{" "}
                <code className="text-slate-300">{CNAME_TARGET}</code> was removed
                by Aurelia months ago. No account claims that name any more.
              </p>
            )}
          </div>

          {checked && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["AURELIA DNS", HOST, "text-slate-300"],
                ["CNAME TARGET", CNAME_TARGET, "text-signal-amber"],
                ["SERVICE STATE", "REMOVED (unclaimed)", "text-signal-red"],
              ].map(([label, value, tone]) => (
                <div
                  key={label}
                  className="rounded border border-void-600 bg-void-950/60 p-3"
                >
                  <div className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    {label}
                  </div>
                  <code className={`mt-1 block break-all text-[11px] ${tone}`}>
                    {value}
                  </code>
                </div>
              ))}
            </div>
          )}

          {checked && !claimed && (
            <div className="mt-4">
              <button
                type="button"
                className="btn-danger"
                onClick={() => setClaimed(true)}
              >
                Simulate claim on training infrastructure
              </button>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
                The claim is simulated entirely inside the training provider's
                sandbox. No real domain, service or account is involved.
              </p>
            </div>
          )}
        </Panel>
      )}

      {claimed && (
        <Panel
          title={`HTTP response · https://${HOST}`}
          right={
            <span className="chip border-signal-red/40 bg-signal-red/10 text-signal-red">
              NOW SERVING ATTACKER-CLAIMED CONTENT
            </span>
          }
        >
          <pre className="code-block text-[11px] text-signal-red">
{`┌──────────────────────────────────────────────┐
│ ORION LEGACY CONSOLE                         │
│                                              │
│ Deployment Integration                        │
│ Webhook Configuration                         │
│ Build Automation                              │
└──────────────────────────────────────────────┘

CI/CD Integration:
  orion-build-production

Repository:
  orion-platform`}
          </pre>

          <div className="mt-4 rounded border border-signal-red/40 bg-signal-red/5 p-4 text-[11px] leading-relaxed text-slate-300">
            <span className="font-bold text-signal-red">FINDING. </span>
            Marcus: <span className="text-slate-300">“Why is an abandoned console
            still connected to our deployment pipeline?”</span>
            <p className="mt-3 text-slate-500">
              The abandoned subdomain didn't lead to an empty service. It led to
              the deployment system — which is the final lead.
            </p>
          </div>
        </Panel>
      )}
    </div>
  );
}
