import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import matter from 'gray-matter';

export interface ConfluenceDocument {
  markdown: string;
  pageId: string;
  source: string;
  title: string;
}

interface ConfluenceFrontmatter {
  confluence_page_id?: number | string;
  title?: string;
}

const execFileAsync = promisify(execFile);

const getRequiredMetadata = (
  data: ConfluenceFrontmatter,
  field: keyof ConfluenceFrontmatter,
  source: string,
) => {
  const rawValue = data[field];
  const value =
    typeof rawValue === 'string'
      ? rawValue.trim()
      : field === 'confluence_page_id' && typeof rawValue === 'number'
        ? String(rawValue)
        : undefined;

  if (!value) {
    throw new Error(`Confluence frontmatter in "${source}" must include "${field}".`);
  }

  return value;
};

/** Get a list of md files, only versioned (with git ls) */
const findTrackedMarkdownFiles = async (repositoryRoot: string): Promise<string[]> => {
  const { stdout } = await execFileAsync('git', ['ls-files', '-z', '--', '*.md'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });

  return stdout
    .split('\0')
    .filter(Boolean)
    .map((filePath) => path.resolve(repositoryRoot, filePath))
    .sort();
};

/**
 * Find markdown files added, copied, modified, or renamed between two revisions.
 * Deleted files are intentionally excluded, since they cannot be synced.
 */
export const findChangedMarkdownFiles = async (
  repositoryRoot: string,
  baseRevision: string,
  headRevision: string,
): Promise<string[]> => {
  const { stdout } = await execFileAsync(
    'git',
    ['diff', '--name-only', '-z', '--diff-filter=ACMR', baseRevision, headRevision, '--', '*.md'],
    {
      cwd: repositoryRoot,
      encoding: 'utf8',
    },
  );

  return stdout
    .split('\0')
    .filter(Boolean)
    .map((filePath) => path.resolve(repositoryRoot, filePath))
    .sort();
};

/**
 * Find only markdown with confluence frontmatter
 */
export const discoverConfluenceDocuments = async (
  repositoryRoot: string,
  sourcePaths?: string[],
): Promise<ConfluenceDocument[]> => {
  const markdownFiles = sourcePaths ?? (await findTrackedMarkdownFiles(repositoryRoot));
  const documents = await Promise.all(
    markdownFiles.map(async (sourcePath) => {
      const markdown = await readFile(sourcePath, 'utf8');
      const frontmatter = matter(markdown);
      if (!('confluence_page_id' in frontmatter.data)) {
        return undefined;
      }

      const source = path.relative(repositoryRoot, sourcePath);
      const data = frontmatter.data as ConfluenceFrontmatter;
      return {
        markdown: frontmatter.content,
        pageId: getRequiredMetadata(data, 'confluence_page_id', source),
        source,
        title: getRequiredMetadata(data, 'title', source),
      };
    }),
  );

  return documents.filter((document): document is ConfluenceDocument => document !== undefined);
};
