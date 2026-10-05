import type { Room } from "./types";

export const projectEcho: Room = {
  id: "echo",
  code: "VT-047",
  name: "Project Echo",
  operation: "PROJECT ECHO",
  title: "The System They Thought They Deleted",
  subtitle:
    "A supposedly decommissioned internal project has started responding again.",
  description:
    "A legacy resource with no owner, no ticket and no inventory entry starts responding at 02:17 AM. Follow five surviving fragments of a system Vantaris believed it had deleted — an abandoned cloud bucket, a forgotten browser extension, a DNS trust relationship, an insecure webhook hub, and secrets preserved in Git history.",
  org: "Vantaris Technologies",
  role: "Junior Cyber Security Analyst",
  difficulty: "medium",
  difficultyLabel: "Pro",
  duration: "40–50 min",
  classification: "INTERNAL SECURITY INVESTIGATION",
  tags: [
    "Cloud",
    "Browser Security",
    "DNS",
    "Webhooks",
    "Git Forensics",
    "OSINT",
  ],
  glyph: "🛰️",
  accent: "signal-cyan",

  premise: [
    "You are a Junior Cyber Security Analyst in the Vantaris Technologies Security Operations Center.",
    "A legacy resource has begun contacting your infrastructure again. It has no owner, no ticket, and no entry in the asset inventory.",
    "You are not looking for one isolated vulnerability. You are looking for the connection between the evidence.",
  ],

  opening: {
    time: "02:17 AM — VANTARIS SECURITY OPERATIONS CENTER",
    headline: "LEGACY RESOURCE CONTACTED",
    lines: [
      "The Security Operations Center is almost completely silent. Most analysts have already left for the night. Only the monitoring wall remains active.",
      "Then — a red alert tears across the board.",
      "Resource: echo-archive-v3 · Last Known Owner: UNKNOWN · Last Active: 19 MONTHS AGO · Current Status: RESPONDING",
      "You search the current Vantaris asset inventory. Nothing. No active project. No owner. No production dependency. No decommissioning ticket. No explanation.",
      "Related host detected: echo-gateway.vantaris.local",
      "Related client detected: Echo Helper 2.4.1",
      "Maya Chen, Security Operations Lead, enters the incident channel. She looks at the hostname. Then at the archived project records. Then back at the alert.",
      "“Echo was shut down two years ago.” A few seconds pass. “At least... that's what the records say.”",
    ],
  },

  objective:
    "Determine why Project Echo is responding after being decommissioned, and reconstruct the surviving infrastructure.",

  taskIds: ["m1", "m2", "m3", "m4", "m5"],

  tasks: [
    {
      id: "m1",
      order: 1,
      index: "01",
      codename: "THE BUCKET THAT REMEMBERED",
      title: "Abandoned Cloud Bucket Investigation",
      tagline: "A storage bucket nobody owns is still holding a map of the old system.",
      topic: "Cloud Security / Asset Discovery",
      statusLabel: "ACTIVE INVESTIGATION",
      minutes: "~8 min",
      xp: 100,
      characters: [
        {
          name: "Ethan Cole",
          role: "Cloud Security Engineer",
          initials: "EC",
          accent: "text-signal-cyan",
        },
      ],
      briefing: [
        "Maya connects you with Ethan Cole, Cloud Security Engineer, who provides access to the suspicious cloud resource inside the training range.",
        "Ethan: “This bucket shouldn't still be accessible. More importantly, it isn't even listed in our current cloud inventory.”",
        "The archive contains an abandoned digital workspace — but one file immediately catches your attention. Open the decommissioning checklist and read it carefully.",
      ],
      objectives: [
        "Enumerate the contents of the echo-archive-v3 bucket",
        "Read the decommissioning checklist and identify what was never removed",
        "Map the legacy architecture recovered from the bucket",
        "Determine when the archive was last touched",
      ],
      simulatorKey: "cloud-archive",
      questions: [
        {
          id: "m1-c1",
          kind: "choice",
          prompt:
            "Migration was declared complete. Which components were still marked PENDING in the checklist?",
          options: [
            {
              id: "core",
              label: "Core Application, Database, Compute Resources",
              detail: "These were the rows marked COMPLETE.",
            },
            {
              id: "pending-four",
              label:
                "Browser Helper, Gateway DNS, Automation Webhook, Archive Storage",
              detail: "Four rows never flipped from PENDING.",
            },
            {
              id: "none",
              label: "Nothing — all rows were complete",
            },
            {
              id: "archive-only",
              label: "Only Archive Storage",
            },
          ],
          correctOptionId: "pending-four",
          hint: "Read shutdown-plan.txt in the migration/ folder.",
        },
        {
          id: "m1-c2",
          kind: "flag",
          prompt:
            "How many months after decommissioning was the archive last accessed? (number only)",
          accept: ["19", "19months"],
          placeholder: "e.g. 12",
          hint: "Check the access history panel.",
        },
        {
          id: "m1-c3",
          kind: "flag",
          prompt:
            "Which hostname does the recovered legacy architecture map point at?",
          accept: ["echo-gateway.vantaris.local", "echo-gateway", "echogateway.vantaris.local"],
          placeholder: "hostname",
          hint: "Open architecture/echo-network.txt.",
        },
      ],
      evidence: {
        id: "ECHO-01",
        label: "CLOUD ARCHIVE",
        finding:
          "Project Echo contains multiple legacy components that were never fully removed. The abandoned bucket preserved the full legacy architecture and the original decommissioning checklist.",
        confidence: "Confirmed",
        source: "Historical migration documentation",
        severity: "high",
      },
      clueChain: ["CLOUD ARCHIVE", "ECHO HELPER", "ECHO GATEWAY"],
      nextLead: "ECHO HELPER",
      debrief: [
        "You stop. The project wasn't completely decommissioned — it was simply declared complete.",
        "The abandoned bucket isn't just storage. It is a map.",
      ],
      secureDesign: [
        "Cloud resources must be enumerated against a source of truth, not against memory or migration paperwork.",
        "A decommissioning ticket is not closed until every dependency row is verified COMPLETE, not merely PENDING.",
        "Storage buckets that outlive their project must be deleted, not just marked unmanaged.",
      ],
    },
    {
      id: "m2",
      order: 2,
      index: "02",
      codename: "THE EXTENSION WITH A MEMORY",
      title: "Malicious Browser Extension Analysis",
      tagline: "A migration utility that was never told the migration ended.",
      topic: "Browser Security / Static Analysis",
      statusLabel: "INVESTIGATION CONTINUED",
      minutes: "~8–10 min",
      xp: 150,
      characters: [
        {
          name: "Zara Malik",
          role: "Browser Security Engineer",
          initials: "ZM",
          accent: "text-signal-violet",
        },
      ],
      briefing: [
        "You contact Zara Malik, Browser Security Engineer. She sends you an archived copy of the Echo Helper extension package.",
        "You initially suspect Echo Helper may have been malicious. Zara checks the historical records — and the truth is different.",
        "Zara: “It wasn't designed to stay forever. But someone forgot to tell it that the migration ended.”",
        "Audit the package, its permissions, and the trust assumption baked into it.",
      ],
      objectives: [
        "Review the extension manifest and the permissions it requests",
        "Trace the network destination hardcoded into the client",
        "Identify the stale code comment left behind by the migration",
        "Articulate the trust assumption the client makes",
      ],
      simulatorKey: "extension-analyzer",
      questions: [
        {
          id: "m2-c1",
          kind: "flag",
          prompt: "What value is assigned to gatewayHost in config.js?",
          accept: ["echo-gateway.vantaris.local", "echo-gateway", "echogateway.vantaris.local"],
          placeholder: "hostname",
          hint: "Open config.js.",
        },
        {
          id: "m2-c2",
          kind: "choice",
          prompt: "Why was Echo Helper originally installed on employee machines?",
          options: [
            {
              id: "malicious",
              label: "It was malicious from the start",
            },
            {
              id: "migration-utility",
              label:
                "It was a legitimate migration utility that helped staff move from Echo to Vantaris Flow",
            },
            {
              id: "monitoring",
              label: "It was employee monitoring software",
            },
            {
              id: "adware",
              label: "It shipped with a third-party bundle",
            },
          ],
          correctOptionId: "migration-utility",
          hint: "Re-read Zara's story twist in the briefing.",
        },
        {
          id: "m2-c3",
          kind: "flag",
          prompt: "Which version of Echo Helper is still active in the wild?",
          accept: ["2.4.1", "241"],
          placeholder: "x.y.z",
          hint: "manifest.json holds the version.",
        },
      ],
      evidence: {
        id: "ECHO-02",
        label: "BROWSER COMPONENT",
        finding:
          "The legacy browser extension still depends on the Echo Gateway. The client trusts the hostname but does not independently establish that the destination behind the name is still the expected gateway.",
        confidence: "Confirmed",
        source: "Archived extension package v2.4.1",
        severity: "high",
      },
      clueChain: [
        "ECHO HELPER",
        "echo-gateway.vantaris.local",
        "LEGACY ECHO GATEWAY",
      ],
      nextLead: "DNS BEHAVIOR",
      debrief: [
        "The problem wasn't the extension's original purpose. The problem was that nobody removed it afterwards.",
        "Zara leaves you with one question: “If the browser trusts the name... what happens when the name points somewhere else?”",
      ],
      secureDesign: [
        "Migration utilities must ship with a removal date and an enforced expiry, not an open-ended TODO comment.",
        "Clients should pin to a verified endpoint identity (certificate pinning / key pinning), not merely a hostname.",
        "Extension permissions such as webRequest and tabs should be revoked as soon as the migration completes.",
      ],
    },
    {
      id: "m3",
      order: 3,
      index: "03",
      codename: "THE HOSTNAME THAT LIED",
      title: "DNS Rebinding Attack",
      tagline: "The name never changed. The destination did.",
      topic: "DNS Security / Trust Relationships",
      statusLabel: "NETWORK INVESTIGATION",
      minutes: "~8–10 min",
      xp: 200,
      characters: [
        {
          name: "Adrian Brooks",
          role: "Network Security Engineer",
          initials: "AB",
          accent: "text-signal-blue",
        },
      ],
      briefing: [
        "You meet Adrian Brooks, Network Security Engineer. He doesn't explain the issue. He simply gives you access to the controlled DNS environment.",
        "Adrian: “Resolve the hostname.” You do.",
        "echo-gateway.vantaris.local → 203.0.113.42",
        "Adrian: “Now resolve it again.”",
        "The result changes. Run the resolver yourself and watch the destination move.",
      ],
      objectives: [
        "Resolve the trusted hostname repeatedly and compare answers",
        "Probe the second destination to identify the service behind it",
        "Explain the trust failure in terms of name vs. destination",
        "Confirm the automation infrastructure is still online",
      ],
      simulatorKey: "dns-rebind",
      questions: [
        {
          id: "m3-c1",
          kind: "flag",
          prompt:
            "What is the SECOND IPv4 address returned for echo-gateway.vantaris.local?",
          accept: ["192.0.2.42", "192.0.2.42/32"],
          placeholder: "0.0.0.0",
          hint: "Run the lookup more than once and read the anomaly block.",
        },
        {
          id: "m3-c2",
          kind: "choice",
          prompt: "What is the deeper trust problem demonstrated here?",
          options: [
            {
              id: "dns-changed",
              label: "The DNS answer simply changed",
            },
            {
              id: "cache",
              label: "The resolver cache was poisoned by an attacker",
            },
            {
              id: "hostname-trusted-not-destination",
              label:
                "The application trusts the hostname without sufficiently validating the destination behind it",
            },
            {
              id: "ttl",
              label: "The TTL was configured too low",
            },
          ],
          correctOptionId: "hostname-trusted-not-destination",
          hint: "The issue is not simply “DNS changed.”",
        },
        {
          id: "m3-c3",
          kind: "flag",
          prompt:
            "What service banner is returned by the second destination? (name the gateway)",
          accept: [
            "echo automation gateway",
            "echoautomationgateway",
            "automation gateway",
          ],
          placeholder: "service name",
          hint: "Use the probe button on the second address.",
        },
      ],
      evidence: {
        id: "ECHO-03",
        label: "NETWORK",
        finding:
          "echo-gateway.vantaris.local participates in a controlled destination-changing scenario. The same trusted name resolves to the still-online Echo Automation Gateway, proving the legacy automation tier was never removed.",
        confidence: "Confirmed",
        source: "Controlled DNS range / 203.0.113.0-24 and 192.0.2.0-24",
        severity: "critical",
      },
      clueChain: [
        "CLOUD ARCHIVE",
        "ECHO HELPER",
        "ECHO GATEWAY",
        "DNS TRUST",
        "AUTOMATION INFRASTRUCTURE",
      ],
      nextLead: "ECHO AUTOMATION HUB",
      debrief: [
        "You stare at the screen. The system that was supposed to be gone... is still online.",
        "The hostname remains the same. The destination changes.",
      ],
      secureDesign: [
        "Do not treat name resolution as an authorisation decision. Validate the peer, not the label.",
        "Pin gateway endpoints with certificates or mutual TLS so a changed DNS answer cannot silently redirect traffic.",
        "Decommissioned trust relationships must be removed from DNS, not left dangling.",
      ],
    },
    {
      id: "m4",
      order: 4,
      index: "04",
      codename: "THE WEBHOOK THAT TRUSTED TOO MUCH",
      title: "Webhook Security Exploitation",
      tagline: "The endpoint checked the shape of the request, not the sender.",
      topic: "API / Webhook Security",
      statusLabel: "APPLICATION INVESTIGATION",
      minutes: "~8–10 min",
      xp: 250,
      characters: [
        {
          name: "Lena Park",
          role: "Application Security Engineer",
          initials: "LP",
          accent: "text-signal-violet",
        },
      ],
      briefing: [
        "Lena Park, Application Security Engineer, gives you access to the Echo Automation Hub inside the training range.",
        "The service exposes POST /api/echo/events and expects an event payload of { event: \"sync.completed\", project: \"echo\" }.",
        "Lena: “How does this service know that the request actually came from an authorized Echo service?”",
        "Send requests from the forge and record exactly which validation steps the service performs.",
      ],
      objectives: [
        "Submit a correctly signed request and observe the control flow",
        "Submit missing, invalid and replayed requests",
        "Identify which verification steps the implementation skips",
        "Document the secure design that should replace it",
      ],
      simulatorKey: "webhook-forge",
      questions: [
        {
          id: "m4-c1",
          kind: "choice",
          prompt: "Which control does the vulnerable implementation fail to enforce?",
          options: [
            {
              id: "json",
              label: "JSON structure validation",
              detail: "This one IS performed.",
            },
            {
              id: "signature-verification",
              label: "Sender authentication / signature verification",
            },
            {
              id: "method",
              label: "HTTP method restriction",
            },
            {
              id: "content-type",
              label: "Content-Type enforcement",
            },
          ],
          correctOptionId: "signature-verification",
          hint: "Compare the vulnerable flow against the secure flow in the debrief.",
        },
        {
          id: "m4-c2",
          kind: "flag",
          prompt:
            "What HTTP status code does the unsigned request receive? (number only)",
          accept: ["202"],
          placeholder: "e.g. 200",
          hint: "Watch the response block after forging a request.",
        },
        {
          id: "m4-c3",
          kind: "flag",
          prompt: "What event name does the endpoint expect?",
          accept: ["sync.completed", "synccompleted"],
          placeholder: "event.name",
          hint: "Check the documented payload.",
        },
      ],
      evidence: {
        id: "ECHO-04",
        label: "APPLICATION",
        finding:
          "The vulnerable training implementation does not consistently enforce sender authentication for Echo webhook requests. Missing, invalid and replayed signatures are all accepted and processed.",
        confidence: "Confirmed",
        source: "Echo Automation Hub training instance",
        severity: "critical",
      },
      clueChain: [
        "ECHO HELPER",
        "ECHO GATEWAY",
        "ECHO AUTOMATION HUB",
        "WEBHOOK",
      ],
      nextLead: "GIT HISTORY",
      debrief: [
        "No real automation is executed — the platform records the finding and moves on.",
        "The entire system is beginning to make sense. But one question remains: who built it?",
      ],
      secureDesign: [
        "Verify an HMAC signature over the raw request body before parsing it.",
        "Validate a timestamp window and reject stale requests.",
        "Maintain a nonce / replay cache so a captured request cannot be reused.",
        "Validate the event schema and the sender identity as separate steps.",
      ],
    },
    {
      id: "m5",
      order: 5,
      index: "05",
      codename: "THE COMMIT THAT REFUSED TO DIE",
      title: "Git History Secret Recovery",
      tagline: "Deleting a secret from the branch doesn't delete it from history.",
      topic: "Git Forensics / Secret Management",
      statusLabel: "FINAL INVESTIGATION",
      minutes: "~8–10 min",
      xp: 300,
      characters: [
        {
          name: "Noah Reed",
          role: "Senior Software Engineer",
          initials: "NR",
          accent: "text-signal-red",
        },
      ],
      briefing: [
        "Noah Reed, Senior Software Engineer, provides access to the echo-platform repository.",
        "The current branch looks clean. No obvious secrets. No active Echo configuration. No webhook credentials. No suspicious files.",
        "Noah gives you one instruction: “Don't look at what exists now.” Then: “Look at what existed before.”",
        "Walk the commit trail and recover the deleted configuration.",
      ],
      objectives: [
        "Walk the full commit history of echo-platform",
        "Locate the file that was deleted from the current branch",
        "Recover the credential value preserved in history",
        "Explain why branch deletion is not secret removal",
      ],
      simulatorKey: "git-history",
      questions: [
        {
          id: "m5-c1",
          kind: "flag",
          prompt:
            "Which deleted file preserves the Echo webhook credential? (path)",
          accept: [
            "config/echo-production.env",
            "echo-production.env",
            "configecho-production.env",
          ],
          placeholder: "path/to/file",
          hint: "Look for the commit that removed credentials.",
        },
        {
          id: "m5-c2",
          kind: "flag",
          prompt: "What is the value of ECHO_WEBHOOK_KEY in the historical file?",
          accept: ["training_only_secret", "trainingonlysecret"],
          placeholder: "value",
          hint: "Open the file at the commit before it was deleted.",
        },
        {
          id: "m5-c3",
          kind: "choice",
          prompt:
            "Why does deleting the file from the current branch fail to remove the secret?",
          options: [
            {
              id: "cache",
              label: "The secret was cached by CI runners",
            },
            {
              id: "history-preserved",
              label:
                "Git preserves every previous version of the file in repository history",
            },
            {
              id: "fork",
              label: "Someone forked the repository",
            },
            {
              id: "backup",
              label: "A nightly backup still contains it",
            },
          ],
          correctOptionId: "history-preserved",
          hint: "The repository is an append-only record by design.",
        },
      ],
      evidence: {
        id: "ECHO-05",
        label: "SOURCE CONTROL",
        finding:
          "Git history preserves deleted Project Echo configuration and connects the cloud archive, browser extension, gateway, DNS, automation hub and webhook into a single system.",
        confidence: "Confirmed",
        source: "echo-platform repository history",
        severity: "critical",
      },
      clueChain: [
        "CLOUD ARCHIVE",
        "ECHO HELPER",
        "ECHO GATEWAY",
        "LEGACY DNS",
        "ECHO AUTOMATION HUB",
        "ECHO WEBHOOK",
        "ECHO GIT REPOSITORY",
      ],
      nextLead: "PROJECT ECHO RECONSTRUCTED",
      debrief: [
        "The repository has preserved the history of Project Echo. And that history connects everything.",
        "You return to Maya. “I found the connection.” She asks: “Between what?”",
      ],
      secureDesign: [
        "Rotate any credential the moment it lands in version control — assume it is already compromised.",
        "Purging history requires a rewrite (git filter-repo / BFG) plus a coordinated rotation and force-push policy.",
        "Prevent the class of issue with secret scanning in pre-commit hooks and CI.",
      ],
    },
  ],

  finalFindings: [
    {
      id: "ECHO-01",
      area: "CLOUD",
      finding:
        "Abandoned cloud storage remained accessible and exposed the legacy architecture and decommissioning checklist.",
      evidence: "echo-archive-v3 · decommissioning rows still PENDING",
      severity: "high",
    },
    {
      id: "ECHO-02",
      area: "BROWSER",
      finding: "Legacy Echo Helper remained installed and connected to the Echo Gateway.",
      evidence: "gatewayHost = echo-gateway.vantaris.local",
      severity: "high",
    },
    {
      id: "ECHO-03",
      area: "NETWORK",
      finding:
        "Controlled DNS testing demonstrated a destination-changing scenario involving the trusted gateway hostname.",
      evidence: "203.0.113.42 → 192.0.2.42",
      severity: "critical",
    },
    {
      id: "ECHO-04",
      area: "APPLICATION",
      finding:
        "The vulnerable training webhook implementation did not consistently enforce sender authentication.",
      evidence: "SIGNATURE: NOT VERIFIED · PROCESSING: SIMULATED",
      severity: "critical",
    },
    {
      id: "ECHO-05",
      area: "SOURCE CONTROL",
      finding: "Deleted configuration remained recoverable from Git history.",
      evidence: "config/echo-production.env · ECHO_WEBHOOK_KEY=TRAINING_ONLY_SECRET",
      severity: "critical",
    },
  ],

  rootCause: "INCOMPLETE DECOMMISSIONING",
  rootCauseDetail: [
    "This wasn't one isolated failure. It was a chain of forgotten dependencies.",
    "Different teams removed different components, but nobody verified the entire dependency chain.",
  ],

  takeaway: [
    "A system does not have to remain completely online to remain a security risk.",
    "Its pieces can survive independently.",
    "A forgotten cloud bucket can preserve an architecture.",
    "An abandoned browser extension can preserve a connection.",
    "A DNS record can preserve a trust relationship.",
    "A webhook can preserve an automation path.",
    "And Git history can preserve what everyone thought had already been deleted.",
    "The system was deleted. The dependencies weren't.",
  ],

  learningOutcomes: [
    "Enumerate cloud resources against a source of truth rather than migration paperwork",
    "Perform static analysis on a legacy browser extension package",
    "Explain why a trusted hostname is not the same as a trusted destination",
    "Identify missing sender authentication controls in a webhook endpoint",
    "Recover a deleted secret from Git history and reason about why rotation is mandatory",
  ],

  closing: {
    speaker: "MAYA CHEN",
    role: "Security Operations Lead",
    lines: [
      "“We spent two years believing Echo was gone.”",
      "“It wasn't gone.”",
      "“You weren't investigating five vulnerabilities.”",
      "“You were investigating one forgotten system.”",
    ],
  },
};
