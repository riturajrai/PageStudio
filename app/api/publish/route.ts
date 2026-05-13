import { NextRequest, NextResponse } from 'next/server';
import { pageSchema } from '@/schemas/pageSchema';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

const publishedVersions: Record<string, any[]> = {};

function generateVersion(previous: any | null, current: any): string {
  if (!previous || !previous.version) {
    return '1.0.0';
  }

  const prevSections = previous.sections || [];
  const currSections = current.sections || [];

  const removedSection = prevSections.some(
    (ps: any) => !currSections.find((cs: any) => cs.id === ps.id)
  );

  const typeChanged = prevSections.some((ps: any) => {
    const match = currSections.find((cs: any) => cs.id === ps.id);

    return match && match.type !== ps.type;
  });

  if (removedSection || typeChanged) {
    const [major] = previous.version.split('.').map(Number);

    return `${major + 1}.0.0`;
  }

  const addedSection = currSections.some(
    (cs: any) => !prevSections.find((ps: any) => ps.id === cs.id)
  );

  if (addedSection) {
    const [major, minor] = previous.version
      .split('.')
      .map(Number);

    return `${major}.${minor + 1}.0`;
  }

  const [major, minor, patch] = previous.version
    .split('.')
    .map(Number);

  return `${major}.${minor}.${patch + 1}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = pageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid schema',
          issues: result.error.issues,
        },
        {
          status: 400,
        }
      );
    }

    const page = result.data;

    const currentHash = createHash('sha256')
      .update(JSON.stringify(page))
      .digest('hex');

    const versions = publishedVersions[page.slug] || [];

    const latest = versions[versions.length - 1] || null;

    if (latest && latest.hash === currentHash) {
      return NextResponse.json({
        skipped: true,
        version: latest.version,
        message: 'Already published',
      });
    }

    const version = generateVersion(latest, page);

    const snapshot = {
      version,
      hash: currentHash,
      publishedAt: new Date().toISOString(),
      slug: page.slug,
      title: page.title,
      sections: page.sections,
      changelog: latest
        ? `Updated from v${latest.version} → v${version}`
        : `Initial release v${version}`,
    };

    if (!publishedVersions[page.slug]) {
      publishedVersions[page.slug] = [];
    }

    publishedVersions[page.slug].push(snapshot);

    // ==========================
    // SAVE JSON FILE
    // ==========================

    const publishDir = path.join(process.cwd(), 'published');

    if (!fs.existsSync(publishDir)) {
      fs.mkdirSync(publishDir);
    }

    const filePath = path.join(
      publishDir,
      `${page.slug}.json`
    );

    fs.writeFileSync(
      filePath,
      JSON.stringify(snapshot, null, 2)
    );

    return NextResponse.json({
      success: true,
      version,
      publishedAt: snapshot.publishedAt,
      changelog: snapshot.changelog,
      message: 'Published locally successfully',
    });
  } catch (error: any) {
    console.error('PUBLISH ERROR:', error);

    return NextResponse.json(
      {
        error: 'Publish failed',
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}