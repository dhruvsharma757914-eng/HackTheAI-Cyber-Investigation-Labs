import type { Room } from "./types";

export const nightfall: Room = {
  id: "nightfall",
  code: "NF-219",
  name: "Operation Black Relay",
  operation: "OPERATION BLACK RELAY",
  title: "The Breach That Left No Single Trace",
  subtitle:
    "Someone didn't break into the system. They moved through the gaps between systems.",
  description:
    "A disabled deployment identity authenticates successfully at 03:14 AM. Behind it follow a container that crossed its isolation boundary, logs that changed their own timeline, an abandoned subdomain, and a secret that survived a deployment. Five weaknesses, five systems, one forgotten chain.",
  org: "Aurelia Systems",
  role: "Security Operations Associate",
  difficulty: "medium",
  difficultyLabel: "Pro",
  duration: "40–50 min",
  classification: "INTERNAL SECURITY INVESTIGATION",
  tags: [
    "Identity",
    "Container Security",
    "Log Forensics",
    "DNS",
    "CI/CD",
    "Secrets",
  ],
  glyph: "🌑",
  accent: "signal-violet",

  premise: [
    "Aurelia Systems operates Orion Grid, a cloud platform used internally for managing deployments, employee access, development environments and automated infrastructure.",
    "The company recently completed a major infrastructure migration. Everything appeared normal.",
    "Five alerts surface in a single night — and each one unlocks the next.",
  ],

  opening: {
    time: "03:14 AM — AURELIA SECURITY OPERATIONS CENTER",
    headline: "NF-219 // SECURITY ALERT",
    lines: [
      "The night shift is almost over when Mira Voss, Aurelia's Incident Response Lead, receives an automated alert.",
      "Authentication Service: ORION-ACCESS · Event: Successful SSO authentication · User: svc-deploy-orion · Location: UNKNOWN · Device: UNKNOWN · Status: AUTHENTICATED",
      "Mira checks the identity. The account belongs to an automated deployment service. But there is one problem — the account was supposed to be disabled.",
      "Mira opens the deployment dashboard. Another alert appears.",
      "Container Anomaly · Workload: orion-worker-17 · Expected: Application Container · Observed: Unexpected Host-Level Interaction",
      "Before Mira can investigate further, the SIEM produces another notification.",
      "Log Integrity Warning · Multiple authentication events appear to have inconsistent timestamps.",
      "Mira pauses. Three unrelated alerts. Or so it seems. She assigns the investigation to you.",
    ],
  },

  objective:
    "Find out how a disabled deployment identity authenticated, interacted with a container, and left behind questionable evidence — and where the chain ends.",

  taskIds: ["m1", "m2", "m3", "m4", "m5"],

  tasks: [
    {
      id: "m1",
      order: 1,
      index: "01",
      codename: "THE IDENTITY THAT SHOULD NOT WORK",
      title: "SSO Misconfiguration & Authentication Abuse",
      tagline: "The account was disabled. The assertion still worked.",
      topic: "Identity & Access / SAML SSO",
      statusLabel: "IDENTITY INVESTIGATION",
      minutes: "~8 min",
      xp: 100,
      characters: [
        {
          name: "Elena Marquez",
          role: "Identity & Access Engineer",
          initials: "EM",
          accent: "text-signal-cyan",
        },
      ],
      briefing: [
        "Elena Marquez, Identity & Access Engineer, joins the investigation after seeing the authentication alert. She provides a controlled copy of Aurelia's SSO configuration.",
        "Identity Provider: Aurelia Identity Cloud · Application: Orion Deployment Console · Authentication: SAML SSO",
        "Service Account: svc-deploy-orion — STATUS: DISABLED. But the authentication logs show LOGIN SUCCESS.",
        "Replay the assertion in the training console and determine why a disabled identity is still being accepted.",
      ],
      objectives: [
        "Inspect the captured SAML assertion and its conditions",
        "Replay the assertion against the Orion Deployment Console",
        "Identify why a disabled account still authenticates",
        "Determine where the newly authenticated identity goes next",
      ],
      simulatorKey: "sso-assertion",
      questions: [
        {
          id: "n1-c1",
          kind: "flag",
          prompt:
            "Which service account authenticated despite being disabled? (account name)",
          accept: ["svc-deploy-orion", "svcdeployorion"],
          placeholder: "svc-...",
          hint: "Read the alert headline.",
        },
        {
          id: "n1-c2",
          kind: "choice",
          prompt: "Why did the application accept the assertion?",
          options: [
            {
              id: "password",
              label: "The account password was never rotated",
            },
            {
              id: "stale-assertion-trusted",
              label:
                "The application trusts a previously issued assertion and does not re-check the identity provider's current account state",
            },
            {
              id: "mfa",
              label: "MFA was disabled for service accounts",
            },
            {
              id: "idp-down",
              label: "The identity provider was offline",
            },
          ],
          correctOptionId: "stale-assertion-trusted",
          hint: "Disabled is a current-state fact. Ask whether the app ever re-reads it.",
        },
        {
          id: "n1-c3",
          kind: "flag",
          prompt:
            "Which SAML condition element defines the assertion's validity window?",
          accept: ["notonorafter", "not-on-or-after", "notonoraftercondition"],
          placeholder: "SAML element",
          hint: "Inspect the <Conditions> block of the assertion.",
        },
      ],
      evidence: {
        id: "NF-01",
        label: "IDENTITY",
        finding:
          "The SSO configuration accepted a stale authentication state. A disabled identity with a previously trusted assertion authenticated successfully because current account state is never re-validated.",
        confidence: "Confirmed",
        source: "Controlled copy of Aurelia SSO configuration",
        severity: "critical",
      },
      clueChain: [
        "AUTHENTICATED IDENTITY",
        "ORION DEPLOYMENT CONSOLE",
        "ORION-WORKER-17",
      ],
      nextLead: "CONTAINER ENVIRONMENT",
      debrief: [
        "The authentication system still trusts something that should no longer be trusted.",
        "Elena hands you the next lead: the authenticated identity reached the Orion Deployment Console, and from there, orion-worker-17.",
      ],
      secureDesign: [
        "Re-validate account state with the identity provider on every assertion, not only at issuance.",
        "Enforce short assertion validity windows and strict clock skew.",
        "Disabled service accounts must also have their issued sessions and tokens revoked — disabling alone is not revocation.",
      ],
    },
    {
      id: "m2",
      order: 2,
      index: "02",
      codename: "THE CONTAINER THAT OPENED THE WRONG DOOR",
      title: "Container Escape Fundamentals",
      tagline: "The boundary was there. The container was standing on both sides of it.",
      topic: "Container Security / Runtime Isolation",
      statusLabel: "RUNTIME INVESTIGATION",
      minutes: "~8–10 min",
      xp: 150,
      characters: [
        {
          name: "Jonas Reed",
          role: "Cloud Infrastructure Engineer",
          initials: "JR",
          accent: "text-signal-blue",
        },
      ],
      briefing: [
        "Jonas Reed, Cloud Infrastructure Engineer, provides a controlled container environment corresponding to orion-worker-17.",
        "Container: orion-worker-17 · Runtime: Docker · Application: Orion Worker · Environment: TRAINING LAB",
        "Several configuration details immediately stand out. The goal is not simply to “escape.” The goal is to answer: why was this container capable of crossing its intended security boundary?",
        "During your inspection you discover a host-side artifact that Jonas does not recognise.",
      ],
      objectives: [
        "Inspect the container's runtime configuration",
        "Identify the settings that weaken the isolation boundary",
        "Locate the host-side artifact left by the container",
        "Document the timeline discrepancy between the two log sources",
      ],
      simulatorKey: "container-inspect",
      questions: [
        {
          id: "n2-c1",
          kind: "choice",
          prompt: "Which runtime setting weakened isolation the most?",
          options: [
            {
              id: "env",
              label: "Environment variables were passed at runtime",
            },
            {
              id: "privileged-true",
              label: "The container runs with --privileged and the host root filesystem mounted",
            },
            {
              id: "logdriver",
              label: "The logging driver was set to json-file",
            },
            {
              id: "restart",
              label: "The restart policy was set to always",
            },
          ],
          correctOptionId: "privileged-true",
          hint: "Run docker inspect and read the HostConfig block.",
        },
        {
          id: "n2-c2",
          kind: "flag",
          prompt: "Which host directory was mounted into the container?",
          accept: ["/var/log/orion", "varlogorion", "/var/log/orion/"],
          placeholder: "/path/on/host",
          hint: "Look at the Mounts array.",
        },
        {
          id: "n2-c3",
          kind: "flag",
          prompt:
            "What host-side log file recorded the privileged operation? (full path)",
          accept: [
            "/var/log/orion/runtime-events.log",
            "varlogorionruntime-events.log",
            "runtime-events.log",
          ],
          placeholder: "/var/log/...",
          hint: "Jonas points you at the artifact he can't explain.",
        },
      ],
      evidence: {
        id: "NF-02",
        label: "CONTAINER",
        finding:
          "The container configuration weakened isolation. Elevated privileges plus a host log directory bind-mount allowed a workload to reach host-level resources and write artefacts outside its expected boundary.",
        confidence: "Confirmed",
        source: "docker inspect orion-worker-17 · /var/log/orion/runtime-events.log",
        severity: "critical",
      },
      clueChain: [
        "CONTAINER",
        "EXCESSIVE PRIVILEGE",
        "HOST INTERACTION",
        "RUNTIME LOGS",
        "TIMELINE DISCREPANCY",
      ],
      nextLead: "LOG INTEGRITY",
      debrief: [
        "Jonas looks confused. “That timestamp doesn't match what I see in the main dashboard.”",
        "The container explains how something reached the host. The logs may explain what happened afterwards.",
      ],
      secureDesign: [
        "Never run workloads with --privileged. Grant the minimum capability set required.",
        "Do not bind-mount host log or configuration directories into application containers.",
        "Enforce a read-only root filesystem and a seccomp/AppArmor profile.",
        "Apply network policies so a container cannot reach host-level services.",
      ],
    },
    {
      id: "m3",
      order: 3,
      index: "03",
      codename: "THE LOGS THAT CHANGED THEIR STORY",
      title: "Log Poisoning & Evidence Manipulation",
      tagline: "The manipulated log wasn't hiding the next system. It revealed it.",
      topic: "Logging Integrity / Digital Forensics",
      statusLabel: "FORENSIC INVESTIGATION",
      minutes: "~8–10 min",
      xp: 200,
      characters: [
        {
          name: "Priya Nandakumar",
          role: "Digital Forensics Specialist",
          initials: "PN",
          accent: "text-signal-amber",
        },
      ],
      briefing: [
        "Priya Nandakumar, Digital Forensics Specialist, gives you two versions of the same authentication log — the live system log and a protected archival copy.",
        "The timestamps are different. Someone, or something, has altered the evidence.",
        "Diff the two sources, isolate the injected content, and recover whatever the manipulation accidentally exposed.",
      ],
      objectives: [
        "Compare the trusted and untrusted log copies line by line",
        "Isolate the injected entries and the falsified timestamps",
        "Extract the hostname embedded in the manipulated record",
        "Explain how untrusted input reached the logging pipeline",
      ],
      simulatorKey: "log-diff",
      questions: [
        {
          id: "n3-c1",
          kind: "flag",
          prompt:
            "In the archived copy, what time does the deployment console access occur? (HH:MM:SS)",
          accept: ["03:15:29", "031529", "03:15"],
          placeholder: "HH:MM:SS",
          hint: "Find the line that differs between the two panels.",
        },
        {
          id: "n3-c2",
          kind: "flag",
          prompt: "Which hostname appears inside the injected log entry?",
          accept: [
            "legacy-console.aurelia-labs.example",
            "legacy-console",
            "legacyconsole.aurelia-labs.example",
          ],
          placeholder: "hostname",
          hint: "Inspect the poisoned entry in the right-hand panel.",
        },
        {
          id: "n3-c3",
          kind: "choice",
          prompt: "What is the core logging design failure?",
          options: [
            {
              id: "retention",
              label: "Log retention was set too short",
            },
            {
              id: "untrusted-input-in-logs",
              label:
                "Application-controlled, untrusted input can be written into the log stream and then trusted as evidence",
            },
            {
              id: "timezone",
              label: "The two systems used different timezones",
            },
            {
              id: "rotation",
              label: "Log rotation deleted the originals",
            },
          ],
          correctOptionId: "untrusted-input-in-logs",
          hint: "Ask who controls the text that lands in the log line.",
        },
      ],
      evidence: {
        id: "NF-03",
        label: "LOGGING",
        finding:
          "Log input could be manipulated, compromising evidence integrity. Injected entries and falsified timestamps made the primary log unreliable as forensic evidence.",
        confidence: "Confirmed",
        source: "Live system log vs. protected archival copy",
        severity: "high",
      },
      clueChain: [
        "AUTHENTICATION",
        "CONTAINER",
        "LOG MANIPULATION",
        "LEGACY HOSTNAME",
      ],
      nextLead: "LEGACY DNS",
      debrief: [
        "Priya searches the historical asset inventory for the hostname. Nothing. The asset was removed from the inventory months ago.",
        "But DNS tells a different story.",
      ],
      secureDesign: [
        "Send logs to an append-only sink that application processes cannot write to.",
        "Keep an archival copy outside the blast radius of the workload.",
        "Never render raw user input into log lines without encoding.",
        "Sign or hash-chain log records so tampering is detectable.",
      ],
    },
    {
      id: "m4",
      order: 4,
      index: "04",
      codename: "THE SUBDOMAIN THAT BELONGED TO NOBODY",
      title: "Subdomain Takeover Simulation",
      tagline: "The abandoned subdomain didn't lead to an empty service. It led to the deployment system.",
      topic: "DNS Hygiene / Subdomain Takeover",
      statusLabel: "INFRASTRUCTURE INVESTIGATION",
      minutes: "~8–10 min",
      xp: 250,
      characters: [
        {
          name: "Marcus Hale",
          role: "Infrastructure & DNS Administrator",
          initials: "MH",
          accent: "text-signal-green",
        },
      ],
      briefing: [
        "Marcus Hale, Infrastructure & DNS Administrator, checks the hostname recovered from the manipulated log.",
        "legacy-console.aurelia-labs.example resolves via CNAME to old-orion-console.training-provider.example.",
        "The original Aurelia service was supposedly removed — but the DNS record was never cleaned up.",
        "Trace the record, confirm the external service is unclaimed, and see what is still wired into the other end.",
      ],
      objectives: [
        "Resolve the legacy hostname and record the CNAME target",
        "Confirm the external service reference is unclaimed",
        "Simulate the takeover inside the training environment",
        "Identify what the abandoned console is still connected to",
      ],
      simulatorKey: "subdomain-takeover",
      questions: [
        {
          id: "n4-c1",
          kind: "flag",
          prompt: "What is the CNAME target of legacy-console?",
          accept: [
            "old-orion-console.training-provider.example",
            "old-orion-console",
            "oldorionconsole.training-provider.example",
          ],
          placeholder: "target.example",
          hint: "Run the DNS lookup.",
        },
        {
          id: "n4-c2",
          kind: "choice",
          prompt: "What condition allowed this takeover to be possible?",
          options: [
            {
              id: "wildcard",
              label: "A wildcard DNS record",
            },
            {
              id: "orphaned-cname",
              label:
                "An orphaned CNAME pointing at a third-party service Aurelia no longer owns or claims",
            },
            {
              id: "dnssec",
              label: "DNSSEC was not enabled",
            },
            {
              id: "registrar",
              label: "The domain registrar account was compromised",
            },
          ],
          correctOptionId: "orphaned-cname",
          hint: "The record outlived the service it pointed to.",
        },
        {
          id: "n4-c3",
          kind: "flag",
          prompt:
            "Which CI/CD pipeline is still referenced by the legacy console?",
          accept: ["orion-build-production", "orionbuildproduction"],
          placeholder: "pipeline-name",
          hint: "Read the integration block after the simulated claim.",
        },
      ],
      evidence: {
        id: "NF-04",
        label: "DNS",
        finding:
          "Orphaned DNS mapping created a simulated subdomain takeover condition. An abandoned CNAME pointed at an unclaimed external service that still referenced Aurelia's deployment pipeline.",
        confidence: "Confirmed",
        source: "legacy-console.aurelia-labs.example CNAME chain",
        severity: "critical",
      },
      clueChain: [
        "DNS RECORD",
        "ORPHANED SERVICE",
        "LEGACY CONSOLE",
        "CI/CD INTEGRATION",
      ],
      nextLead: "CI/CD PIPELINE",
      debrief: [
        "Marcus immediately notices something. “Why is an abandoned console still connected to our deployment pipeline?”",
        "Beneath the integration reference: Repository: orion-platform.",
      ],
      secureDesign: [
        "Delete DNS records in the same change that removes the service they point to.",
        "Inventory every CNAME that points outside your control and verify the target is still owned.",
        "Require proof-of-ownership on third-party service claims so a dangling record cannot be reclaimed by someone else.",
      ],
    },
    {
      id: "m5",
      order: 5,
      index: "05",
      codename: "THE SECRET INSIDE THE PIPELINE",
      title: "CI/CD Pipeline Secret Exposure",
      tagline: "The current branch isn't where the problem is.",
      topic: "CI/CD Security / Secret Management",
      statusLabel: "FINAL INVESTIGATION",
      minutes: "~8–10 min",
      xp: 300,
      characters: [
        {
          name: "Theo Bennett",
          role: "DevOps Security Engineer",
          initials: "TB",
          accent: "text-signal-red",
        },
      ],
      briefing: [
        "Theo Bennett, DevOps Security Engineer, provides access to a historical copy of the orion-platform repository.",
        "The current branch looks clean: README.md, src/, tests/, .github/ — no obvious credentials.",
        "Theo: “The current branch isn't where the problem is.”",
        "Scan the workflow history and the configuration file history to recover the exposed secret and close the chain.",
      ],
      objectives: [
        "Review the CI/CD workflow history",
        "Find where the webhook token was hardcoded",
        "Recover the training value preserved in version history",
        "Reconstruct the full Black Relay chain",
      ],
      simulatorKey: "cicd-secrets",
      questions: [
        {
          id: "n5-c1",
          kind: "flag",
          prompt: "What is the hardcoded training token value?",
          accept: ["training_only_token", "trainingonlytoken"],
          placeholder: "VALUE",
          hint: "Scan the historical configuration file.",
        },
        {
          id: "n5-c2",
          kind: "flag",
          prompt: "Which environment variable holds the token?",
          accept: ["orion_webhook_token", "orionwebhooktoken"],
          placeholder: "ORION_...",
          hint: "It is referenced as a GitHub Actions secret in the workflow.",
        },
        {
          id: "n5-c3",
          kind: "choice",
          prompt: "What is the correct remediation?",
          options: [
            {
              id: "delete-file",
              label: "Delete the file from the current branch and move on",
            },
            {
              id: "rotate-and-purge-history",
              label:
                "Rotate the credential immediately, then purge it from history and add secret scanning to prevent recurrence",
            },
            {
              id: "private-repo",
              label: "Make the repository private",
            },
            {
              id: "gitignore",
              label: "Add the path to .gitignore",
            },
          ],
          correctOptionId: "rotate-and-purge-history",
          hint: "Once a secret is committed, assume it is already compromised.",
        },
      ],
      evidence: {
        id: "NF-05",
        label: "CI/CD",
        finding:
          "Historical CI/CD configuration exposed a synthetic secret. Removing the file from the active branch did not remove the credential from version history.",
        confidence: "Confirmed",
        source: "orion-platform workflow and configuration history",
        severity: "critical",
      },
      clueChain: [
        "SSO",
        "ORION CONSOLE",
        "CONTAINER",
        "LOGGING SYSTEM",
        "LEGACY SUBDOMAIN",
        "OLD CONSOLE",
        "CI/CD PIPELINE",
        "ORION AUTOMATION",
      ],
      nextLead: "PROJECT NIGHTFALL REVEAL",
      debrief: [
        "The five incidents are not independent. They form one chain.",
        "Mira overlays all five pieces on the incident board.",
      ],
      secureDesign: [
        "Never hardcode credentials in configuration — use the CI secret store with scoped, short-lived tokens.",
        "Rotate on exposure, then purge history with git filter-repo / BFG.",
        "Enable automated secret scanning on push and in pull requests.",
        "Grant pipeline tokens the minimum scope and audit every historical workflow.",
      ],
    },
  ],

  finalFindings: [
    {
      id: "NF-01",
      area: "IDENTITY",
      finding: "SSO configuration accepted a stale authentication state.",
      evidence: "svc-deploy-orion: DISABLED → LOGIN SUCCESS",
      severity: "critical",
    },
    {
      id: "NF-02",
      area: "CONTAINER",
      finding: "Container configuration weakened isolation.",
      evidence: "orion-worker-17 · --privileged · host log bind-mount",
      severity: "critical",
    },
    {
      id: "NF-03",
      area: "LOGGING",
      finding:
        "Log input could be manipulated, compromising evidence integrity.",
      evidence: "03:11:47 → 03:15:29 · injected legacy-console hostname",
      severity: "high",
    },
    {
      id: "NF-04",
      area: "DNS",
      finding:
        "Orphaned DNS mapping created a simulated subdomain takeover condition.",
      evidence: "CNAME → old-orion-console.training-provider.example (unclaimed)",
      severity: "critical",
    },
    {
      id: "NF-05",
      area: "CI/CD",
      finding: "Historical CI/CD configuration exposed a synthetic secret.",
      evidence: "ORION_WEBHOOK_TOKEN=TRAINING_ONLY_TOKEN",
      severity: "critical",
    },
  ],

  rootCause: "SURVIVING SECURITY ASSUMPTIONS",
  rootCauseDetail: [
    "Operation Black Relay was not a single attack. It was the result of security assumptions surviving longer than the infrastructure they were created for.",
    "Each weakness alone appeared manageable. Together, they created a chain.",
  ],

  takeaway: [
    "Removing infrastructure is not the same as removing trust.",
    "A disabled identity leaves an assumption behind.",
    "A privileged container leaves a path behind.",
    "An unprotected log leaves a story behind.",
    "A dangling DNS record leaves a name behind.",
    "A committed secret leaves a key behind.",
    "The breach didn't hide inside one system. It survived in the connections between them.",
  ],

  learningOutcomes: [
    "Recognise stale authentication state that outlives an identity's disabled status",
    "Audit container runtime configuration for isolation-breaking settings",
    "Detect log manipulation and reason about evidence integrity",
    "Trace an orphaned CNAME to an unclaimed third-party service",
    "Scan CI/CD history for hardcoded secrets and scope the remediation correctly",
  ],

  closing: {
    speaker: "MIRA VOSS",
    role: "Incident Response Lead",
    lines: [
      "“Every system we found was supposed to be gone.”",
      "“But removing infrastructure isn't the same as removing trust.”",
      "SSO TRUST ✓ IDENTIFIED",
      "CONTAINER PATH ✓ IDENTIFIED",
      "LOG MANIPULATION ✓ IDENTIFIED",
      "DNS EXPOSURE ✓ IDENTIFIED",
      "CI/CD SECRET ✓ IDENTIFIED",
      "INVESTIGATION: COMPLETE — SYSTEM STATUS: CONTAINED",
    ],
  },
};
