import { updateConfluencePage } from './confluence-client';
import { discoverConfluenceDocuments } from './documents';
import { markdownToConfluenceStorage } from './markdown';

/** Atlassian formatted banner */
const DEFAULT_BANNER =
  '<ac:structured-macro ac:name="warning"><ac:rich-text-body><p><strong>Auto-generated from GitHub. Do not manually edit.</strong>';

const syncDocumentationToConfluence = async () => {
  const documents = await discoverConfluenceDocuments(process.cwd());

  await Promise.all(
    documents.map(async (document) => {
      const converted = markdownToConfluenceStorage(document.markdown);
      const sourceUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/blob/${process.env.GITHUB_SHA}/${document.source}`;
      const banner =
        process.env.INPUT_BANNER ||
        `${DEFAULT_BANNER} <a href="${sourceUrl}">Source on GitHub</a>.</p></ac:rich-text-body></ac:structured-macro>`;
      const storage = [banner, converted.storage].filter(Boolean).join('\n');

      try {
        await updateConfluencePage(document.pageId, { storage, title: document.title });
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
