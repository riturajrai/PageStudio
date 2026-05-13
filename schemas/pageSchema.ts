import { z } from 'zod';

export const sectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['hero', 'cta', 'testimonial', 'featureGrid', 'textSlider', 'footer']),
  props: z.record(z.any()),
});

export const pageSchema = z.object({
  pageId: z.string(),
  slug: z.string(),
  title: z.string(),
  sections: z.array(sectionSchema),
});