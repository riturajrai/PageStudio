interface Props {
  quote: string;
  author: string;
  role?: string;
}

export default function TestimonialSection({ quote, author, role }: Props) {
  return (
    <section className="py-16 bg-zinc-50">
      <div className="max-w-2xl mx-auto text-center px-6">
        <p className="text-2xl italic text-zinc-700">"{quote}"</p>
        <div className="mt-6">
          <p className="font-semibold">{author}</p>
          {role && <p className="text-sm text-zinc-500">{role}</p>}
        </div>
      </div>
    </section>
  );
}