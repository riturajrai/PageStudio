import { NextRequest, NextResponse } from 'next/server';
import { pageSchema } from '@/schemas/pageSchema';
import { createHash } from 'crypto';

// In-memory store (production mein database use karo)
const publishedVersions: Record<string, any[]> = {};

function generateVersion(
  previous: any | null,
  current: any
): string {
  if (!previous) return '1.0.0';

  const prevSections = previous.sections || [];
  const currSections = current.sections || [];

  // Major: section removed or type changed
  const removed = prevSections.some(
    (ps: any) => !currSections.find((cs: any) => cs.id === ps.id)
  );
  const typeChanged = prevSections.some((ps: any) => {
    const match = currSections.find((cs: any) => cs.id === ps.id);
    return match && match.type !== ps.type;
  });

  if (removed || typeChanged) {
    const [major] = previous.version.split('.').map(Number);
    return `${major + 1}.0.0`;
  }

  // Minor: section added
  const added = currSections.some(
    (cs: any) => !prevSections.find((ps: any) => ps.id === cs.id)
  );
  if (added) {
    const [major, minor] = previous.version.split('.').map(Number);
    return `${major}.${minor + 1}.0`;
  }

  // Patch: only props/text changed
  const [major, minor, patch] = previous.version.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

export async function POST(req: NextRequest) {
  try {
    // RBAC check (header se role check karo)
    const role = req.headers.get('x-user-role') || 'viewer';
    if (role !== 'publisher') {
      return NextResponse.json(
        { error: 'Forbidden: Only publishers can publish' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = pageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid page schema', issues: result.error.issues },
        { status: 400 }
      );
    }

    const page = result.data;
    const slug = page.slug;

    // Hash current draft to check idempotency
    const currentHash = createHash('sha256')
      .update(JSON.stringify(page))
      .digest('hex');

    const versions = publishedVersions[slug] || [];
    const latest = versions[versions.length - 1] || null;

    // Idempotent: same content = skip
    if (latest && latest.hash === currentHash) {
      return NextResponse.json({
        message: 'No changes detected — already published',
        version: latest.version,
        skipped: true,
      });
    }

    // Generate SemVer
    const version = generateVersion(latest, page);

    // Create immutable snapshot
    const snapshot = {
      version,
      hash: currentHash,
      publishedAt: new Date().toISOString(),
      slug,
      title: page.title,
      sections: page.sections,
      changelog: latest
        ? `Updated from v${latest.version} to v${version}`
        : `Initial release v${version}`,
    };

    // Save snapshot
    if (!publishedVersions[slug]) publishedVersions[slug] = [];
    publishedVersions[slug].push(snapshot);

    return NextResponse.json({
      success: true,
      version,
      publishedAt: snapshot.publishedAt,
      changelog: snapshot.changelog,
      totalVersions: publishedVersions[slug].length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Publish failed', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }
  return NextResponse.json({
    versions: publishedVersions[slug] || [],
  });
}