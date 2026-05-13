'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Renderer from '@/components/Renderer';
import Link from 'next/link';

export default function PreviewClient({ slug }: { slug: string }) {
  const { sections, title, isDirty } = useSelector(
    (state: RootState) => state.draftPage
  );

  // Agar Redux mein data nahi hai
  if (!sections || sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-zinc-800 mb-4">No Draft Found</h1>
          <p className="text-zinc-500 mb-6">
            Please open the studio first to load a page.
          </p>
          <Link
            href={`/studio/${slug}`}
            className="bg-black text-white px-6 py-3 rounded-xl hover:bg-zinc-800 transition inline-block"
          >
            Open Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="font-semibold text-base">{title}</h1>
          <p className="text-xs text-zinc-400">/{slug}</p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          <Link
            href={`/studio/${slug}`}
            className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition"
          >
            Edit in Studio
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <Renderer sections={sections} />

    </div>
  );
}