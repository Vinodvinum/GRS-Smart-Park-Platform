import Link from "next/link";

export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className={`brand${dark ? " light" : ""}`} aria-label="GRS Smart Park home">
      <span className="brand-mark">G</span>
      <span>GRS <b>SMART PARK</b></span>
    </Link>
  );
}
