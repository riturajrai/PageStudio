interface Props {
  label?: string;
  url?: string;
  variant?: 'primary' | 'secondary';
}

export default function CTASection({
  label = "Get Started",
  url = "#",
  variant = 'primary',
}: Props) {
  return (
    <section className="py-16 text-center">
      <a
        href={url}
        className={`inline-block px-8 py-4 rounded-xl font-medium text-lg transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 ${
          variant === 'primary'
            ? 'bg-black text-white hover:bg-zinc-800 focus:ring-black'
            : 'bg-white text-black border-2 border-black hover:bg-zinc-100'
        }`}
        aria-label={label}
      >
        {label}
      </a>
    </section>
  );
}