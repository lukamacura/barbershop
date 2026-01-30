import Image from "next/image";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=700&fit=crop",
    alt: "Haircut style example",
  },
  {
    src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=700&fit=crop",
    alt: "Beard trim result",
  },
  {
    src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=700&fit=crop",
    alt: "Classic cut",
  },
];

export function Gallery() {
  return (
    <section
      id="gallery"
      className="bg-[var(--surface-mid)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2
              id="gallery-heading"
              className="mb-4 font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl"
            >
              Our work
            </h2>
            <p className="mb-8 max-w-md text-base leading-relaxed text-[var(--foreground-muted)]">
              From fades to classic cuts and beard styling—see what we do every day in the chair.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--foreground-muted)]">1 / {galleryImages.length}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--border-muted)] text-[var(--foreground)] transition-default focus-ring hover:bg-[var(--surface-dark)] hover:border-[var(--surface-dark)] hover:text-white"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--border-muted)] text-[var(--foreground)] transition-default focus-ring hover:bg-[var(--surface-dark)] hover:border-[var(--surface-dark)] hover:text-white"
                  aria-label="Next image"
                >
                  →
                </button>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {galleryImages.map(({ src, alt }) => (
              <div
                key={src}
                className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)]"
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
