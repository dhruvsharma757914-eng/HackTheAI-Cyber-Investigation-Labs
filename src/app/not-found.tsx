import Link from "next/link";
import { Panel } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <Panel title="VT-SOC // lookup failed">
        <div className="space-y-4 text-center">
          <p className="text-3xl">🛰️</p>
          <p className="text-sm font-bold tracking-wider text-slate-200">
            RESOURCE NOT FOUND
          </p>
          <p className="text-[11px] leading-relaxed text-slate-500">
            The requested case, mission or asset does not exist in the training
            inventory.
          </p>
          <Link href="/" className="btn-primary">
            Return to case files
          </Link>
        </div>
      </Panel>
    </div>
  );
}
