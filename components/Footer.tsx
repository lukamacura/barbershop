import Link from "next/link";

const menuLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "Our barbers" },
  { href: "#prices", label: "Our prices" },
  { href: "#visit", label: "Visit us" },
  { href: "#gallery", label: "Our work" },
  { href: "#contact", label: "Contact" },
];

const quickLinks = [
  { href: "#", label: "Careers" },
  { href: "#", label: "Privacy" },
  { href: "#contact", label: "Location & contact" },
];

export function Footer({ onBookClick }: { onBookClick: () => void }) {
  return (
    <footer
      id="contact"
      className="bg-[var(--surface-dark)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <p className="font-serif text-xl font-semibold tracking-tight text-white">
              Sharp Cut
            </p>
            <p className="mt-3 text-base text-white/80">
              Example Street 1<br />
              21000 Novi Sad
            </p>
            <p className="mt-2 text-sm text-white/80">
              <a href="tel:+381123456789" className="underline focus-ring rounded">
                +381 12 345 6789
              </a>
            </p>
            <p className="mt-1 text-sm text-white/80">
              <a href="mailto:hello@example.com" className="underline focus-ring rounded">
                hello@example.com
              </a>
            </p>
            <div className="mt-4 flex gap-3" aria-label="Social links">
              {["Facebook", "Instagram", "Twitter"].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-default focus-ring hover:bg-white/20"
                  aria-label={name}
                >
                  <span className="text-xs font-medium">{name[0]}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold tracking-tight text-white">
              Menu
            </h3>
            <ul className="mt-4 space-y-2">
              {menuLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-base text-white/80 underline-offset-2 hover:underline focus-ring rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold tracking-tight text-white">
              Quick links
            </h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-base text-white/80 underline-offset-2 hover:underline focus-ring rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold tracking-tight text-white">
              Hours
            </h3>
            <p className="mt-4 text-base text-white/80">
              Mon–Fri 9:00–20:00<br />
              Sat 9:00–16:00
            </p>
            <button
              type="button"
              onClick={onBookClick}
              className="mt-6 w-full rounded-[var(--radius-btn)] bg-[var(--accent)] py-3.5 px-5 text-base font-semibold text-white transition-default focus-ring hover:bg-[var(--accent-hover)] sm:w-auto sm:px-6"
            >
              Book appointment
            </button>
          </div>
        </div>
        <p className="mt-12 border-t border-white/20 pt-8 text-center text-base text-white/60">
          © Sharp Cut Novi Sad. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
