'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import {
  loadDraft,
  addSection,
  updateSectionProps,
  reorderSections,
} from '@/redux/slices/draftPageSlice';
import Renderer from '@/components/Renderer';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Edit3, Type, Star,
  ArrowRight, Footprints, Eye, Upload, Check, GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Sortable Section Item ──────────────────────────────────
function SortableSection({
  section,
  index,
  onEdit,
}: {
  section: any;
  index: number;
  onEdit: (id: string, type: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-zinc-800 border border-zinc-700 px-3 py-3 rounded-lg flex items-center gap-2 group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 touch-none flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-xs text-zinc-500">#{index + 1}</span>
        <p className="capitalize text-sm font-medium truncate">{section.type}</p>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={() => onEdit(section.id, section.type)}
      >
        <Edit3 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Main Studio Page ───────────────────────────────────────
export default function StudioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const { sections, title } = useSelector((state: RootState) => state.draftPage);

  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<null | {
    version: string;
    changelog: string;
  }>(null);

  // Clean Slug
  const cleanSlug = slug && slug !== 'undefined' ? slug : 'demo-page';

  // ── Load Initial Data ──
  useEffect(() => {
    if (!cleanSlug) return;

    dispatch(
      loadDraft({
        pageId: '1',
        slug: cleanSlug,
        title: title || `Studio - ${cleanSlug}`,
        sections: [
          {
            id: '1',
            type: 'hero',
            props: {
              heading: 'Build beautiful landing pages',
              subheading: 'With Page Studio + Contentful',
            },
          },
          {
            id: '2',
            type: 'textSlider',
            props: {
              slides: [
                {
                  heading: 'Innovation at its finest',
                  subheading: 'Transforming ideas into reality',
                  author: 'Rituraj rai',
                },
              ],
            },
          },
          {
            id: '3',
            type: 'testimonial',
            props: {
              quote: 'This is the best page builder I have used!',
              author: 'Rituraj rai',
              role: 'Product Designer',
            },
          },
          {
            id: '4',
            type: 'cta',
            props: { label: 'Get Started Free', url: '#' },
          },
          {
            id: '5',
            type: 'footer',
            props: {
              text: 'Made with Page Studio',
              copyright: '2026 All rights reserved',
            },
          },
        ],
      })
    );
  }, [dispatch, cleanSlug]);

  // ── Edit Handler ──
  const handleEdit = (sectionId: string, type: string) => {
    // ... (your existing edit logic - can be improved later with modals)
    if (type === 'hero') {
      const heading = prompt('New Heading:', 'Updated Heading');
      if (heading) dispatch(updateSectionProps({ id: sectionId, props: { heading } }));
    } else if (type === 'cta') {
      const label = prompt('New CTA Label:', 'Click Here');
      if (label) dispatch(updateSectionProps({ id: sectionId, props: { label } }));
    } else if (type === 'testimonial') {
      const quote = prompt('New Testimonial Quote:', 'Amazing experience!');
      if (quote) dispatch(updateSectionProps({ id: sectionId, props: { quote } }));
    } else if (type === 'footer') {
      const text = prompt('Footer Text:', 'Made with Page Studio');
      if (text) dispatch(updateSectionProps({ id: sectionId, props: { text } }));
    } else if (type === 'textSlider') {
      const heading = prompt('New Slide Heading:', 'Innovation at its finest');
      if (heading) {
        dispatch(updateSectionProps({
          id: sectionId,
          props: { slides: [{ heading, subheading: 'Transforming ideas into reality', author: 'Rituraj rai' }] }
        }));
      }
    }
  };

  // ── Publish Handler ──
  const handlePublish = async () => {
    setPublishing(true);
    setPublishStatus(null);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'publisher',
        },
        body: JSON.stringify({
          pageId: '1',
          slug: cleanSlug,
          title: title || `Studio - ${cleanSlug}`,
          sections,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPublishStatus({ version: data.version, changelog: data.changelog });
        setTimeout(() => setPublishStatus(null), 5000);
      } else if (data.skipped) {
        alert('No changes detected — already up to date');
      } else {
        alert('Publish failed: ' + (data.message || data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error during publish');
    } finally {
      setPublishing(false);
    }
  };

  // ── Drag & Drop ──
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    const reordered = arrayMove([...sections], oldIndex, newIndex);
    dispatch(reorderSections(reordered));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* LEFT SIDEBAR */}
      <div className="w-80 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="font-semibold text-sm">Page Studio</p>
            <p className="text-xs text-zinc-500">/{cleanSlug}</p>
          </div>
        </div>

        {/* Add Section */}
        <div className="p-5 border-b border-zinc-800">
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">ADD SECTION</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => dispatch(addSection('hero'))} variant="outline" size="sm">
              <Type className="mr-2 h-3 w-3" /> Hero
            </Button>
            <Button onClick={() => dispatch(addSection('textSlider'))} variant="outline" size="sm">
              <Star className="mr-2 h-3 w-3" /> Slider
            </Button>
            <Button onClick={() => dispatch(addSection('testimonial'))} variant="outline" size="sm">
              <Star className="mr-2 h-3 w-3" /> Testimonial
            </Button>
            <Button onClick={() => dispatch(addSection('cta'))} variant="outline" size="sm">
              <ArrowRight className="mr-2 h-3 w-3" /> CTA
            </Button>
            <Button onClick={() => dispatch(addSection('footer'))} variant="outline" size="sm" className="col-span-2">
              <Footprints className="mr-2 h-3 w-3" /> Footer
            </Button>
          </div>
        </div>

        {/* Sections List */}
        <div className="p-5 flex-1 overflow-auto">
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
            SECTIONS ({sections.length})
          </h3>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section, i) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    index={i}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Publish Status */}
        {publishStatus && (
          <div className="mx-4 mb-4 bg-emerald-900/50 border border-emerald-600 rounded-lg p-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Check className="h-4 w-4" />
              Published v{publishStatus.version}
            </div>
            <p>{publishStatus.changelog}</p>
          </div>
        )}

        {/* Bottom Buttons */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <button
            onClick={() => window.open(`/preview/${cleanSlug}`, '_blank')}
            className="flex items-center justify-center gap-2 w-full border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm hover:bg-zinc-800 transition"
          >
            <Eye className="h-4 w-4" /> Open Preview
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center justify-center gap-2 w-full bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {publishing ? 'Publishing...' : 'Publish to Contentful'}
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW */}
      <div className="flex-1 overflow-auto bg-white text-black">
        <div className="sticky top-0 bg-white border-b px-8 py-3 z-10 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-base">Live Preview</h2>
            <p className="text-xs text-zinc-500">{title || `Studio - ${cleanSlug}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Live</span>
          </div>
        </div>
        <Renderer sections={sections} />
      </div>
    </div>
  );
}