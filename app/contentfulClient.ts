import { createClient } from 'contentful';

if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN) {
  throw new Error('Missing Contentful environment variables. Check your .env.local file.');
}

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  environment: 'master', 
});

export async function getPageBySlug(slug: string) {
  try {
    const response = await client.getEntries({
      content_type: 'page',
      'fields.slug': slug,
      include: 2,
      limit: 1,
    });

    if (response.items.length === 0) {
      return null; // Page not found
    }

    return response.items[0].fields;
  } catch (error: any) {
    console.error('Contentful Fetch Error:', error.message);
    throw new Error(`Failed to fetch page "${slug}" from Contentful`);
  }
}