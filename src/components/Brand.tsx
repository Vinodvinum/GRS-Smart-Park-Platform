import Image from "next/image";
import Link from "next/link";

const GRS_LOGO = "https://grsfantasypark.com/wp-content/uploads/2025/04/GRS-rebranding-Logo-v27-01-1-1.png";

export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className={`brand${dark ? " light" : ""}`} aria-label="GRS Smart Park home">
      <Image
        src={GRS_LOGO}
        alt="GRS Fantasy Park"
        width={118}
        height={42}
        className="brand-logo"
        priority
      />
      <span className="brand-product">SMART PARK</span>
    </Link>
  );
}
