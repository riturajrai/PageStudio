import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN!,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
  host: 'preview.contentful.com',
});

export async function getPageBySlug(slug: string, preview = false) {
  try {
    const activeClient = preview ? previewClient : client;
    const response = await activeClient.getEntries({
      content_type: 'page',
      'fields.slug': slug,
      include: 2,
      limit: 1,
    } as any);

    if (response.items.length === 0) return null;

    const item = response.items[0].fields as any;

    // Transform Contentful response → clean PageData shape
    return {
      pageId: response.items[0].sys.id,
      slug: item.slug,
      title: item.title,
      sections: (item.sections || []).map((sec: any) => ({
        id: sec.sys?.id || sec.id,
        type: sec.fields?.type || sec.type,
        props: sec.fields?.props || sec.props || {},
      })),
    };
  } catch (error: any) {
    console.error('Contentful Error:', error.message);
    return null;
  }
}