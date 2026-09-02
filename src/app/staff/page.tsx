import Link from "next/link";
import { ArrowLeft, CircleUserRound, ShieldCheck, Users, UserCheck } from "lucide-react";
import { Brand } from "@/components/Brand";

const staff = [
  ["Anil K.", "Operations", "Water Zone"],
  ["Ravi S.", "Supervisor", "Water Zone"],
  ["Meena R.", "Front Desk", "Guest Services"],
  ["Kiran P.", "Operations", "Snow Zone"],
];

export default function Staff() {
  return (
    <div className="opsShell">
      <header className="opsTop">
        <Brand dark />
        <Link href="/operations" className="opsBack"><ArrowLeft size={13}/> Operations</Link>
      </header>
      <main className="container opsContent">
        <div className="opsHeader">
          <div>
            <div className="kicker">STAFF MANAGEMENT</div>
            <h1>People on the floor.</h1>
            <p>Role, zone and operational status · Demo data</p>
          </div>
        </div>
        <div className="statGrid">
          <div className="stat"><span><Users size={15}/> On duty</span><strong>4</strong><small className="good">All zones covered</small></div>
          <div className="stat"><span><UserCheck size={15}/> Available</span><strong>3</strong><small>Response capacity</small></div>
          <div className="stat"><span><ShieldCheck size={15}/> Supervisors</span><strong>1</strong><small>Water Zone</small></div>
          <div className="stat"><span>Roles</span><strong>4</strong><small>RBAC foundation</small></div>
        </div>
        <section className="opsPanel" style={{ marginTop: 14 }}>
          <div className="kicker">DIRECTORY</div>
          <h3>Active staff</h3>
          <div className="staffGrid">
            {staff.map(s => (
              <div className="staffCard" key={s[0]}>
                <div className="avatar large"><CircleUserRound size={20}/></div>
                <div><b>{s[0]}</b><small>{s[1]} · {s[2]}</small></div>
                <span className="status low">ON DUTY</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
