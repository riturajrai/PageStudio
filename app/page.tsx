// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit3, Eye, Upload } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-zinc-900 mb-6">
          Page Studio
        </h1>
        <p className="text-2xl text-zinc-600 mb-10 max-w-2xl mx-auto">
          Build, Edit, Preview & Publish beautiful landing pages with Contentful
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Open Studio Button */}
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/studio/demo">
              <Edit3 className="mr-3 h-5 w-5" />
              Open Studio
            </Link>
          </Button>

          {/* Live Preview Button */}
          <Button asChild size="lg" variant="outline" className="text-lg px-8">
            <Link href="/preview/demo">
              <Eye className="mr-3 h-5 w-5" />
              Live Preview
            </Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl border">
            <Edit3 className="h-10 w-10 text-black mb-4" />
            <h3 className="text-xl font-semibold mb-2">Visual Editor</h3>
            <p className="text-zinc-600">Real-time editing with Redux</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border">
            <Eye className="h-10 w-10 text-black mb-4" />
            <h3 className="text-xl font-semibold mb-2">Instant Preview</h3>
            <p className="text-zinc-600">See changes live</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border">
            <Upload className="h-10 w-10 text-black mb-4" />
            <h3 className="text-xl font-semibold mb-2">Versioned Publish</h3>
            <p className="text-zinc-600">SemVer + Immutable releases</p>
          </div>
        </div>
      </div>
    </div>
  );
}