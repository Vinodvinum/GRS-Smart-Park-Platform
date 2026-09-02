import Link from "next/link";
import { ArrowLeft, CheckCircle2, LockKeyhole, Server, ShieldCheck, TestTube2, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Brand } from "@/components/Brand";

const items: Array<[string, string, string, LucideIcon]> = [
 ["Architecture","Modular full-stack foundation is documented and layered.","READY",CheckCircle2],
 ["Security","Server-side authorization, secrets and production auth still require environment-specific configuration.","ACTION",LockKeyhole],
 ["Data","PostgreSQL + Prisma foundation exists; production database migration/review is required.","ACTION",Server],
 ["Testing","Unit/integration/E2E suites should be executed against the final environment.","ACTION",TestTube2],
 ["Observability","Health endpoint and explicit integration boundaries are present; production telemetry must be configured.","ACTION",TriangleAlert],
];

export default function Readiness(){
 return <div className="opsShell"><header className="opsTop"><Brand dark/><Link href="/operations" className="opsBack"><ArrowLeft size={13}/> Operations</Link></header><main className="container opsContent"><div className="opsHeader"><div><div className="kicker">PRODUCTION HARDENING</div><h1>Ready to harden. Not pretending to be live.</h1><p>Production-readiness checklist · Portfolio environment</p></div><span className="status medium">REVIEW REQUIRED</span></div><div className="readinessGrid">{items.map(([title,text,state,Icon])=>{const I=Icon as typeof CheckCircle2;return <div className="readinessCard" key={String(title)}><div className="readinessIcon"><I size={18}/></div><div><div className="readinessTop"><b>{title}</b><span className={"status "+(state==="READY"?"low":"medium")}>{String(state)}</span></div><p>{text}</p></div></div>})}</div><section className="misCallout"><ShieldCheck size={21}/><div><div className="kicker">FINAL PRINCIPLE</div><h3>Never claim a production integration that is not connected.</h3><p>This project is designed so real credentials, systems and workflows can be added without faking them in the portfolio.</p></div></section></main></div>}
