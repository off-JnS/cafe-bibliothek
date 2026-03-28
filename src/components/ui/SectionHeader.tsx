interface Props {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionHeader({ title, subtitle, centered = true, light = false }: Props) {
  return (
    <div className={centered ? "text-center" : ""}>
      <h2
        className={`font-heading text-2xl font-bold sm:text-3xl md:text-4xl ${
          light ? "text-cream" : "text-charcoal"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mx-auto mt-3 max-w-2xl text-base leading-relaxed sm:text-lg ${
            light ? "text-cream/80" : "text-warm-gray"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
