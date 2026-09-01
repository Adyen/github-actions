import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { discoverConfluenceDocuments, findChangedMarkdownFiles } from './documents';

const execFile = promisify(execFileCallback);

describe('changed Confluence documents', () => {
  let repositoryRoot: string;

  beforeEach(async () => {
    repositoryRoot = await mkdtemp(path.join(os.tmpdir(), 'confluence-documents-'));
    await execFile('git', ['init', '--quiet'], { cwd: repositoryRoot });
    await execFile('git', ['config', 'user.email', 'test@example.com'], { cwd: repositoryRoot });
    await execFile('git', ['config', 'user.name', 'Test User'], { cwd: repositoryRoot });
    await mkdir(path.join(repositoryRoot, 'docs'), { recursive: true });
    await writeFile(
      path.join(repositoryRoot, 'docs', 'synced.md'),
      '---\nconfluence_page_id: 123\ntitle: Synced page\n---\nOriginal content\n',
    );
    await writeFile(path.join(repositoryRoot, 'docs', 'unchanged.md'), 'Unchanged content\n');
    await execFile('git', ['add', '.'], { cwd: repositoryRoot });
    await execFile('git', ['commit', '--quiet', '-m', 'Initial documentation'], {
      cwd: repositoryRoot,
    });
  });

  afterEach(async () => {
    await rm(repositoryRoot, { force: true, recursive: true });
  });

  it('finds only changed markdown files and syncs eligible ones', async () => {
    const { stdout: baseRevision } = await execFile('git', ['rev-parse', 'HEAD'], {
      cwd: repositoryRoot,
    });
    const syncedPath = path.join(repositoryRoot, 'docs', 'synced.md');
    const unsyncedPath = path.join(repositoryRoot, 'docs', 'new.md');
    await writeFile(
      syncedPath,
      '---\nconfluence_page_id: 123\ntitle: Synced page\n---\nUpdated content\n',
    );
    await writeFile(unsyncedPath, 'No frontmatter\n');
    await execFile('git', ['add', '.'], { cwd: repositoryRoot });
    await execFile('git', ['commit', '--quiet', '-m', 'Update documentation'], {
      cwd: repositoryRoot,
    });
    const { stdout: headRevision } = await execFile('git', ['rev-parse', 'HEAD'], {
      cwd: repositoryRoot,
    });

    const changedFiles = await findChangedMarkdownFiles(
      repositoryRoot,
      baseRevision.trim(),
      headRevision.trim(),
    );

    expect(changedFiles).toEqual([unsyncedPath, syncedPath]);
    await expect(discoverConfluenceDocuments(repositoryRoot, changedFiles)).resolves.toEqual([
      {
        markdown: 'Updated content\n',
        pageId: '123',
        source: 'docs/synced.md',
        title: 'Synced page',
      },
    ]);
  });
});
