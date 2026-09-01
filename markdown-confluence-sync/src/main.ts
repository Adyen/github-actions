import { readFile } from 'node:fs/promises';

import { updateConfluencePage } from './confluence-client';
import { discoverConfluenceDocuments, findChangedMarkdownFiles } from './documents';
import { markdownToConfluenceAdf, prependWarningBanner } from './markdown';

interface PushEvent {
  before?: unknown;
}

const isInitialPush = (revision: string) => /^0+$/.test(revision);

/** Figures out which md files actually changed between revisions */
const discoverDocumentsToSync = async () => {
  const repositoryRoot = process.cwd();
  if (process.env.GITHUB_EVENT_NAME !== 'push' || !process.env.GITHUB_EVENT_PATH) {
    return discoverConfluenceDocuments(repositoryRoot);
  }

  const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8')) as PushEvent;
  const baseRevision = event.before;
  const headRevision = process.env.GITHUB_SHA;
  if (typeof baseRevision !== 'string' || !headRevision || isInitialPush(baseRevision)) {
    return discoverConfluenceDocuments(repositoryRoot);
  }

  try {
    const changedMarkdownFiles = await findChangedMarkdownFiles(
      repositoryRoot,
      baseRevision,
      headRevision,
    );
    return discoverConfluenceDocuments(repositoryRoot, changedMarkdownFiles);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    throw new Error(
      `Unable to diff history of changed Markdown files. Ensure the checkout action uses fetch-depth: 0. ${message}`,
    );
  }
};

const syncDocumentationToConfluence = async () => {
  const documents = await discoverDocumentsToSync();

  await Promise.all(
    documents.map(async (document) => {
      const converted = markdownToConfluenceAdf(document.markdown);
      const sourceUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/blob/${process.env.GITHUB_SHA}/${document.source}`;
      const banner =
        process.env.INPUT_BANNER ||
        `**Auto-generated from GitHub. Do not manually edit.** [Source on GitHub](${sourceUrl}).`;
      const body = prependWarningBanner(converted, banner);

      try {
        await updateConfluencePage(document.pageId, { body, title: document.title });
        console.log(`Synced from ${document.source} to Confluence page ${document.pageId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        throw new Error(
          `Failed to sync from "${document.source}" to Confluence page ${document.pageId}: ${message}`,
        );
      }
    }),
  );
};

syncDocumentationToConfluence().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
