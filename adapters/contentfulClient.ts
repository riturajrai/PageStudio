import { createClient } from 'contentful';

export const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

export const previewClient = createClient({
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

    if (!response.items.length) return null;

    const entry: any = response.items[0];
    const fields = entry.fields;

    return {
      pageId: entry.sys.id,
      slug: fields.slug,
      title: fields.title,
      sections: (fields.sections || []).map((sec: any) => ({
        id: sec.sys.id,
        type: sec.fields.type,
        props: sec.fields.props || {},
      })),
    };
  } catch (err: any) {
    console.error(err.message);
    return null;
  }
}