"use client";

import type { ComponentType } from "react";
import { CloudArchiveSimulator } from "./CloudArchiveSimulator";
import { ExtensionAnalyzer } from "./ExtensionAnalyzer";
import { DnsRebindSimulator } from "./DnsRebindSimulator";
import { WebhookForge } from "./WebhookForge";
import { GitHistoryExplorer } from "./GitHistoryExplorer";
import { SsoAssertionTester } from "./SsoAssertionTester";
import { ContainerInspector } from "./ContainerInspector";
import { LogDiff } from "./LogDiff";
import { SubdomainTakeover } from "./SubdomainTakeover";
import { CicdSecretScanner } from "./CicdSecretScanner";

const REGISTRY: Record<string, ComponentType> = {
  "cloud-archive": CloudArchiveSimulator,
  "extension-analyzer": ExtensionAnalyzer,
  "dns-rebind": DnsRebindSimulator,
  "webhook-forge": WebhookForge,
  "git-history": GitHistoryExplorer,
  "sso-assertion": SsoAssertionTester,
  "container-inspect": ContainerInspector,
  "log-diff": LogDiff,
  "subdomain-takeover": SubdomainTakeover,
  "cicd-secrets": CicdSecretScanner,
};

export function MissionSimulator({ simulatorKey }: { simulatorKey: string }) {
  const Component = REGISTRY[simulatorKey];

  if (!Component) {
    return (
      <div className="panel p-6 text-center text-[11px] text-slate-500">
        Lab module <code className="text-slate-300">{simulatorKey}</code> is not
        available in this build.
      </div>
    );
  }

  return <Component />;
}
