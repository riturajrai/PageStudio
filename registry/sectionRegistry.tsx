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
  textSlider: TextSliderSection,     // ← Added
} as const;

export type RegisteredSectionType = keyof typeof sectionRegistry;

export const getSectionComponent = (type: string) => {
  const Component = sectionRegistry[type as RegisteredSectionType];
  
  if (!Component) {
    return function UnsupportedSection() {
      return (
        <div className="p-8 text-center border-2 border-dashed border-red-300 bg-red-50 rounded-xl my-8">
          Unsupported Section: <strong>{type}</strong>
        </div>
      );
    };
  }
  return Component;
};