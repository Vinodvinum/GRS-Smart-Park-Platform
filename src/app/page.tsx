import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Compass,
  Headphones,
  QrCode,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import { experiences, queueZones, requests } from "@/lib/demo-data";
import { AuthStatus } from "@/components/AuthStatus";

const modes = [
  {
    icon: Ticket,
    eyebrow: "GUEST",
    title: "Plan, book & enjoy",
    text: "Discover experiences, plan a visit, access a digital pass and get help without friction.",
    href: "/guest",
  },
  {
    icon: Zap,
    eyebrow: "OPERATIONS",
    title: "Run the park",
    text: "See queues, requests, incidents and fast operational actions in one workspace.",
    href: "/operations",
  },
  {
    icon: BarChart3,
    eyebrow: "MIS + INTELLIGENCE",
    title: "Turn activity into decisions",
    text: "Bring operational signals together for reporting, trends, exceptions and management insight.",
    href: "/intelligence",
  },
];

const trust = [
  ["Guest-first", "Fast paths for planning and help"],
  ["Operations-ready", "Actionable status and exceptions"],
  ["Intelligence layer", "Built to connect with MIS"],
];

export default function HomePage() {
  const primaryQueue = queueZones[0];
  const primaryRequest = requests[0];

  return (
    <main className="home">
      <div className="demoRibbon">
        <span><CircleDot size={10} /> PORTFOLIO CONCEPT</span>
        <strong>GRS Smart Park Platform</strong>
        <small>Demo data only · not connected to private GRS systems</small>
      </div>

      <nav className="homeNav container" aria-label="Primary navigation">
        <Link href="/" className="homeBrand" aria-label="GRS Smart Park home">
          <span className="homeBrandMark">G</span>
          <span>
            GRS <b>SMART PARK</b>
            <small>CONNECTED PARK PLATFORM</small>
          </span>
        </Link>

        <div className="homeNavLinks">
          <Link href="/experiences">Experiences</Link>
          <Link href="/plan">Plan visit</Link>
          <Link href="/guide">Guide</Link>
          <Link href="/operations">Operations</Link>
          <Link href="/intelligence">Intelligence</Link>
        </div>

        <div className="homeNavActions">
          <AuthStatus />
          <Link href="/booking" className="navCta">Book a visit <ArrowRight size={14} /></Link>
        </div>
      </nav>

      <section className="homeHero container">
        <div className="heroContent">
          <div className="heroEyebrow"><span className="liveDot" /> ONE DIGITAL LAYER FOR THE PARK</div>

          <h1>
            One park.
            <br />
            <span>Every moment connected.</span>
          </h1>

          <p className="heroLead">
            A concept for bringing the guest journey, park operations, service workflows and management intelligence
            into one connected platform.
          </p>

          <div className="heroActions">
            <Link href="/guest" className="heroPrimary">Explore the guest journey <ArrowRight size={16} /></Link>
            <Link href="/operations" className="heroSecondary"><Zap size={15} /> Open operations</Link>
          </div>

          <div className="heroProof">
            <div className="proofItem">
              <strong>04</strong>
              <span>Experiences</span>
            </div>
            <div className="proofDivider" />
            <div className="proofItem">
              <strong>01</strong>
              <span>Connected platform</span>
            </div>
            <div className="proofDivider" />
            <div className="proofItem">
              <strong>∞</strong>
              <span>Data signals</span>
            </div>
          </div>
        </div>

        <div className="heroVisual heroVisualPhoto">
          <Image src="https://grsfantasypark.com/wp-content/uploads/2023/11/Fun-Family-water-park-jpg.webp" alt="GRS Fantasy Park water rides" fill priority sizes="(max-width: 1000px) 100vw, 50vw" className="heroActualImage" />
          <div className="heroImageShade" />
          <div className="heroGlow heroGlowA" />
          <div className="heroGlow heroGlowB" />
          <div className="heroScene">
            <div className="sceneTop">
              <span className="sceneLabel">LIVE PARK VIEW</span>
              <span className="sceneStatus"><CircleDot size={9} /> Connected</span>
            </div>

            <div className="sceneSky">
              <div className="sunOrb" />
              <div className="cloud cloudOne" />
              <div className="cloud cloudTwo" />
              <div className="ride rideOne" />
              <div className="ride rideTwo" />
              <div className="waterBand waterOne" />
              <div className="waterBand waterTwo" />
            </div>

            <div className="sceneOverlay">
              <div>
                <span>NOW</span>
                <strong>Make the next hour count.</strong>
              </div>
              <div className="sceneMini">
                <Users size={14} />
                <span>Guest flow</span>
                <b>Live</b>
              </div>
            </div>
          </div>

          <div className="heroFloatCard floatOne">
            <div className="floatIcon"><QrCode size={16} /></div>
            <div>
              <span>DIGITAL PASS</span>
              <strong>Ready for entry</strong>
            </div>
            <CheckCircle2 size={16} className="floatCheck" />
          </div>

          <div className="heroFloatCard floatTwo">
            <div className="floatIcon green"><Waves size={16} /></div>
            <div>
              <span>QUEUE SIGNAL</span>
              <strong>{primaryQueue.risk} · {primaryQueue.minutes} min</strong>
            </div>
            <ChevronRight size={16} className="floatArrow" />
          </div>
        </div>
      </section>

      <section className="container trustStrip">
        {trust.map(([title, text]) => (
          <div key={title} className="trustItem">
            <CheckCircle2 size={15} />
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="homeSection container">
        <div className="sectionIntro">
          <div>
            <span className="sectionKicker">THREE CONNECTED MODES</span>
            <h2>Different teams. One operating picture.</h2>
          </div>
          <p>
            The platform is designed around the full park journey — from discovery and booking to operational action
            and management intelligence.
          </p>
        </div>

        <div className="modeGrid">
          {modes.map(({ icon: Icon, eyebrow, title, text, href }, index) => (
            <Link href={href} className={`modeCard mode${index}`} key={title}>
              <div className="modeTop">
                <span className="modeIcon"><Icon size={19} /></span>
                <span className="modeIndex">0{index + 1}</span>
              </div>
              <div>
                <span className="modeEyebrow">{eyebrow}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <span className="modeLink">Open workspace <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="homeSection container experienceSection">
        <div className="sectionIntro">
          <div>
            <span className="sectionKicker">THE PARK LAYER</span>
            <h2>Experiences become part of one journey.</h2>
          </div>
          <Link href="/experiences" className="sectionLink">See all experiences <ArrowRight size={14} /></Link>
        </div>

        <div className="experienceRail">
          {experiences.map((x, i) => (
            <Link href="/experiences" className="expTile" key={x.id}>
              <div className={`expArt art${i}`}><span>0{i + 1}</span></div>
              <div className="expBody">
                <span>EXPERIENCE</span>
                <h3>{x.name.replace("GRS ", "")}</h3>
                <p>{x.description}</p>
                <ArrowRight size={15} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="decisionSection">
        <div className="container decisionGrid">
          <div className="decisionCopy">
            <span className="sectionKicker">FROM ACTIVITY TO ACTION</span>
            <h2>Operations become signals. Signals become decisions.</h2>
            <p>
              The operating layer is designed to surface exceptions fast, while the intelligence layer turns those
              signals into management-ready information.
            </p>
            <div className="decisionFlow">
              <FlowItem icon={<Ticket size={15} />} label="Guest + Booking" />
              <FlowItem icon={<Waves size={15} />} label="Operations" />
              <FlowItem icon={<Headphones size={15} />} label="Service" />
              <FlowItem icon={<ShieldCheck size={15} />} label="Incidents" />
              <FlowItem icon={<BarChart3 size={15} />} label="MIS" active />
            </div>
            <Link href="/intelligence" className="decisionLink">Open intelligence workspace <ArrowRight size={15} /></Link>
          </div>

          <div className="signalPanel">
            <div className="signalHeader">
              <div>
                <span>DECISION SIGNALS</span>
                <strong>What needs attention?</strong>
              </div>
              <Sparkles size={18} />
            </div>

            <SignalRow
              icon={<Waves size={16} />}
              title="Queue pressure"
              text={`${primaryQueue.zone} · ${primaryQueue.minutes} min`}
              status={primaryQueue.risk.toUpperCase()}
            />
            <SignalRow
              icon={<Headphones size={16} />}
              title="Guest service"
              text={`${primaryRequest.category} · ${primaryRequest.status.replace("_", " ")}`}
              status={primaryRequest.status}
            />
            <SignalRow
              icon={<ClipboardList size={16} />}
              title="Management view"
              text="Ready for KPI drill-down"
              status="MIS"
            />
          </div>
        </div>
      </section>

      <section className="homeSection container finalCta">
        <div className="finalPanel">
          <div>
            <span className="sectionKicker">THE CONCEPT</span>
            <h2>Built as a connected park OS.</h2>
            <p>
              Guest experience in the front. Operational workflows in the middle. MIS and intelligence behind it.
            </p>
          </div>
          <div className="finalActions">
            <Link href="/guest" className="heroPrimary">Start with the guest journey <ArrowRight size={16} /></Link>
            <Link href="/readiness" className="heroSecondary"><Compass size={15} /> Platform readiness</Link>
          </div>
        </div>
      </section>

      <footer className="homeFooter container">
        <div>
          <Link href="/" className="footerBrand"><span className="homeBrandMark">G</span><span>GRS SMART PARK</span></Link>
          <p>Portfolio concept by Vinod M. · Demo data only.</p>
        </div>
        <div className="footerLinks">
          <Link href="/experiences">Experiences</Link>
          <Link href="/booking">Booking</Link>
          <Link href="/operations">Operations</Link>
          <Link href="/intelligence">MIS & Intelligence</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </footer>
    </main>
  );
}

function FlowItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={active ? "flowItem active" : "flowItem"}>
      <span>{icon}</span>
      <strong>{label}</strong>
    </div>
  );
}

function SignalRow({ icon, title, text, status }: { icon: React.ReactNode; title: string; text: string; status: string }) {
  return (
    <div className="signalRow">
      <span className="signalIcon">{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
      <span className={`signalStatus ${status.toLowerCase().replace(/\\s+/g, "-")}`}>{status}</span>
    </div>
  );
}
