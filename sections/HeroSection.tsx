interface Props {
  heading?: string;
  subheading?: string;
  backgroundColor?: string;
}

export default function HeroSection({
  heading = "Welcome",
  subheading = "This is a hero section",
  backgroundColor = "bg-zinc-900",
}: Props) {
  return (
    <section className={`py-24 text-center text-white ${backgroundColor}`}>
      <h1 className="text-6xl font-bold tracking-tight">{heading}</h1>
      <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto">{subheading}</p>
    </section>
  );
}