import Link from "next/link";
import { Brand } from "@/components/Brand";
import { AuthStatus } from "@/components/AuthStatus";

export function GuestNav() {
  return (
    <nav className="topbar container" aria-label="Guest navigation">
      <Brand />
      <div className="navlinks">
        <Link href="/experiences" className="navlink">Experiences</Link>
        <Link href="/plan" className="navlink">Plan My Visit</Link>
        <Link href="/guide" className="navlink">Guide</Link>
        <Link href="/offers" className="navlink hide-mobile">Offers</Link>
        <Link href="/my-visit" className="navlink hide-mobile">My Visit</Link>
        <AuthStatus />
      </div>
      <Link href="/booking" className="small-cta">Book a visit <span>→</span></Link>
    </nav>
  );
}
