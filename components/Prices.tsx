const hairPrices = [
  { name: "Classic cut", price: "€35" },
  { name: "Fade", price: "€40" },
  { name: "Buzz cut", price: "€25" },
  { name: "Styling", price: "€20" },
  { name: "Kids cut", price: "€22" },
];

const beardPrices = [
  { name: "Beard trim", price: "€18" },
  { name: "Hot towel shave", price: "€35" },
  { name: "Shape up", price: "€15" },
];

const otherPrices = [
  { name: "Hair + beard combo", price: "€55" },
  { name: "Consultation", price: "€10" },
];

export function Prices({ onBookClick }: { onBookClick?: () => void }) {
  return (
    <section
      id="prices"
      className="relative bg-[var(--surface-beige)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="prices-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="prices-heading"
          className="mb-10 font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl"
        >
          Our prices
        </h2>
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-muted)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border-muted)] bg-[var(--surface-mid)]">
                <th
                  scope="col"
                  className="px-6 py-4 font-serif text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]"
                >
                  Service
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right font-serif text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]"
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={2}
                  className="bg-[var(--surface-dark)] px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-white"
                >
                  Hair
                </td>
              </tr>
              {hairPrices.map(({ name, price }) => (
                <tr
                  key={name}
                  className="border-b border-[var(--border-subtle)] transition-default hover:bg-[var(--surface-mid)]/60"
                >
                  <td className="px-6 py-4 text-base text-[var(--foreground)]">{name}</td>
                  <td className="px-6 py-4 text-right font-semibold text-[var(--accent)]">
                    {price}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={2}
                  className="bg-[var(--surface-dark)] px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-white"
                >
                  Beard
                </td>
              </tr>
              {beardPrices.map(({ name, price }) => (
                <tr
                  key={name}
                  className="border-b border-[var(--border-subtle)] transition-default hover:bg-[var(--surface-mid)]/60"
                >
                  <td className="px-6 py-4 text-base text-[var(--foreground)]">{name}</td>
                  <td className="px-6 py-4 text-right font-semibold text-[var(--accent)]">
                    {price}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={2}
                  className="bg-[var(--surface-dark)] px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-white"
                >
                  Other
                </td>
              </tr>
              {otherPrices.map(({ name, price }) => (
                <tr
                  key={name}
                  className="border-b border-[var(--border-subtle)] last:border-b-0 transition-default hover:bg-[var(--surface-mid)]/60"
                >
                  <td className="px-6 py-4 text-base text-[var(--foreground)]">{name}</td>
                  <td className="px-6 py-4 text-right font-semibold text-[var(--accent)]">
                    {price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-6">
          <p className="text-base text-[var(--foreground-muted)]">
            Ready for a sharp look? Book your slot with us.
          </p>
          <button
            type="button"
            onClick={onBookClick}
            className="shrink-0 rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white transition-default focus-ring hover:bg-[var(--accent-hover)] active:scale-[0.99]"
          >
            Book appointment
          </button>
        </div>
      </div>
    </section>
  );
}
