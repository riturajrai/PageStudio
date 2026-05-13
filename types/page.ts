export type SectionType = 
  | 'hero' 
  | 'cta' 
  | 'testimonial' 
  | 'featureGrid' 
  | 'textSlider'
  | 'footer';

export interface Section {
  id: string;
  type: SectionType;
  props: Record<string, any>;
}

export interface PageData {
  pageId: string;
  slug: string;
  title: string;
  sections: Section[];
}