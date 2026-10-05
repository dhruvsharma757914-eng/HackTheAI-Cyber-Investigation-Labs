"use client";

import { useState } from "react";
import { Panel } from "@/components/ui";

const ASSERTION_XML = `<saml:Assertion ID="_a7f3c1e9" Version="2.0"
  IssueInstant="2026-09-17T22:04:11Z">
  <saml:Issuer>Aurelia Identity Cloud</saml:Issuer>
  <saml:Subject>
    <saml:NameID Format="...:persistent">svc-deploy-orion</saml:NameID>
    <saml:SubjectConfirmation Method="...:bearer">
      <saml:SubjectConfirmationData
        NotOnOrAfter="2026-09-18T04:04:11Z"
        Recipient="https://orion-console.aurelia-labs.example/saml/acs" />
    </saml:SubjectConfirmation>
  </saml:Subject>
  <saml:Conditions
    NotBefore="2026-09-17T22:04:11Z"
    NotOnOrAfter="2026-09-18T04:04:11Z" />
  <saml:AttributeStatement>
    <saml:Attribute Name="role">
      <saml:AttributeValue>deployer</saml:AttributeValue>
    </saml:Attribute>
    <saml:Attribute Name="project">
      <saml:AttributeValue>orion</saml:AttributeValue>
    </saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>`;

interface Attempt {
  n: number;
  at: string;
  outcome: "success" | "denied";
  detail: string;
}

export function SsoAssertionTester() {
  const [enforce, setEnforce] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [busy, setBusy] = useState(false);

  const attemptCount = attempts.length;
  const hasSucceeded = attempts.some((a) => a.outcome === "success");

  function replay() {
    setBusy(true);
    window.setTimeout(() => {
      setAttempts((prev) => [
        ...prev,
        {
          n: prev.length + 1,
          at: new Date(Date.UTC(2026, 8, 18, 3, 14, 0)).toISOString().slice(11, 19),
          outcome: enforce ? "denied" : "success",
          detail: enforce
            ? "Assertion signature valid, but IdP reports svc-deploy-orion STATUS: DISABLED → rejected"
            : "Assertion accepted. Issuer trusted, NotOnOrAfter has not passed. Account state never re-checked.",
        },
      ]);
      setBusy(false);
    }, 300);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Identity provider record"
          right={
            <span className="chip border-signal-red/40 bg-signal-red/10 text-signal-red">
              DISABLED
            </span>
          }
        >
          <dl className="text-[11px]">
            {[
              ["Identity provider", "Aurelia Identity Cloud"],
              ["Application", "Orion Deployment Console"],
              ["Authentication", "SAML SSO"],
              ["Service account", "svc-deploy-orion"],
              ["Account status", "DISABLED"],
              ["Disabled on", "2026-09-15 (during migration)"],
              ["Last issued assertion", "2026-09-17 22:04:11Z"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-4 border-b border-void-700 py-2 last:border-0"
              >
                <dt className="text-slate-600">{k}</dt>
                <dd
                  className={
                    k === "Account status" ? "text-signal-red" : "text-slate-300"
                  }
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 border-t border-void-700 pt-3 text-[11px] leading-relaxed text-slate-500">
            The account was disabled two days before the login succeeded. Disabling
            an identity does not revoke an assertion that was already issued.
          </p>
        </Panel>

        <Panel title="Captured assertion · _a7f3c1e9">
          <pre className="code-block max-h-[300px] overflow-auto text-[11px]">
            {ASSERTION_XML.split("\n").map((line, i) => (
              <div
                key={i}
                className={
                  line.includes("NotOnOrAfter")
                    ? "text-signal-amber"
                    : line.includes("svc-deploy-orion")
                      ? "text-signal-cyan"
                      : "text-slate-400"
                }
              >
                {line || " "}
              </div>
            ))}
          </pre>
        </Panel>
      </div>

      <Panel
        title="Replay console · orion-console.aurelia-labs.example"
        right={
          <button
            type="button"
            className="btn-primary !px-3 !py-1.5"
            onClick={replay}
            disabled={busy}
          >
            {busy ? "Transmitting..." : "Replay assertion"}
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded border border-void-600 bg-void-900/60 px-3 py-2.5">
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={enforce}
              onChange={(e) => setEnforce(e.target.checked)}
              className="h-3.5 w-3.5 accent-emerald-400"
            />
            Enforce current account state on every assertion
            <span className="text-slate-600">
              (the remediation — compare the results)
            </span>
          </label>
        </div>

        {attemptCount === 0 ? (
          <p className="text-[11px] text-slate-600">
            Replay the captured assertion to observe whether the console
            re-validates the identity's current state.
          </p>
        ) : (
          <ul className="space-y-2">
            {attempts.map((a) => (
              <li
                key={a.n}
                className={`rounded border p-3 text-[11px] ${
                  a.outcome === "success"
                    ? "border-signal-red/40 bg-signal-red/5"
                    : "border-signal-green/40 bg-signal-green/5"
                }`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-slate-600">attempt #{a.n}</span>
                  <span className="text-slate-500">{a.at}Z</span>
                  <span
                    className={`chip ${
                      a.outcome === "success"
                        ? "border-signal-red/40 bg-signal-red/10 text-signal-red"
                        : "border-signal-green/40 bg-signal-green/10 text-signal-green"
                    }`}
                  >
                    {a.outcome === "success" ? "LOGIN SUCCESS" : "ACCESS DENIED"}
                  </span>
                </div>
                <p className="mt-1.5 text-slate-400">{a.detail}</p>
              </li>
            ))}
          </ul>
        )}

        {hasSucceeded && !enforce && (
          <div className="mt-4 rounded border border-signal-red/40 bg-signal-red/5 p-4 text-[11px] leading-relaxed text-slate-300">
            <span className="font-bold text-signal-red">FINDING. </span>
            The application accepted a stale authentication state. A disabled
            identity authenticated because the assertion — not the current account
            record — is what the console trusts.
            <div className="mt-3">
              <span className="text-slate-500">
                The authenticated identity now has a session on the Orion
                Deployment Console, and from there reaches orion-worker-17.
              </span>
            </div>
          </div>
        )}

        {enforce && attempts.some((a) => a.outcome === "denied") && (
          <div className="mt-4 rounded border border-signal-green/40 bg-signal-green/5 p-4 text-[11px] leading-relaxed text-slate-300">
            <span className="font-bold text-signal-green">REMEDIATION ACTIVE. </span>
            With current-state enforcement enabled, the same assertion is rejected.
            The signature was never the problem — the missing re-validation was.
          </div>
        )}
      </Panel>
    </div>
  );
}
