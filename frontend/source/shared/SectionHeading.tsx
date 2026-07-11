export function SectionHeading({
  overline,
  title,
  description,
}: {
  overline: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3">
      <span className="font-mono text-xs uppercase tracking-[0.32em] text-magma-ember">
        {overline}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-400">{description}</p>
      ) : null}
    </div>
  );
}
