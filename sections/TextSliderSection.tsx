'use client';

import { useState, useEffect } from 'react';

interface Slide {
  heading: string;
  subheading?: string;
  author?: string;
}

interface Props {
  slides?: Slide[];
  autoPlay?: boolean;
  interval?: number;
}

export default function TextSliderSection({
  slides = [],
  autoPlay = true,
  interval = 4000,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  if (slides.length === 0) {
    return <div className="py-16 text-center text-gray-500">No slides available</div>;
  }

  const current = slides[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-br from-zinc-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="min-h-[280px] flex items-center justify-center">
          <div>
            <h2 className="text-5xl font-bold tracking-tight mb-6 transition-all">
              {current.heading}
            </h2>
            {current.subheading && (
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                {current.subheading}
              </p>
            )}
            {current.author && (
              <p className="mt-8 text-lg text-zinc-500">— {current.author}</p>
            )}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-3 mt-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white scale-125' : 'bg-zinc-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}