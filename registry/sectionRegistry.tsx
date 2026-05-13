import HeroSection from '@/sections/HeroSection';
import CTASection from '@/sections/CTASection';
import TestimonialSection from '@/sections/TestimonialSection';
import FooterSection from '@/sections/FooterSection';
import TextSliderSection from '@/sections/TextSliderSection';

export const sectionRegistry = {
  hero: HeroSection,
  cta: CTASection,
  testimonial: TestimonialSection,
  footer: FooterSection,
  textSlider: TextSliderSection,
} as const;

export type RegisteredSectionType = keyof typeof sectionRegistry;

export const getSectionComponent = (type: string) => {
  const Component = sectionRegistry[type as RegisteredSectionType];

  if (!Component) {
    return function UnsupportedSection() {
      return (
        <div className="p-8 border border-red-400 rounded-xl bg-red-50 text-center">
          Unsupported Section: <strong>{type}</strong>
        </div>
      );
    };
  }

  return Component;
};