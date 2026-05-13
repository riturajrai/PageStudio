interface Props {
  text?: string;
  copyright?: string;
}

export default function FooterSection({ 
  text = "Made with Page Studio", 
  copyright = "© 2026 All rights reserved" 
}: Props) {
  return (
    <footer className="bg-zinc-900 text-white py-12 text-center">
      <p className="text-lg">{text}</p>
      <p className="text-sm text-zinc-500 mt-2">{copyright}</p>
    </footer>
  );
}