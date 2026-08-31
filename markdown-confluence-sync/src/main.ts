import { updateConfluencePage } from './confluence-client';
import { discoverConfluenceDocuments } from './documents';
import { markdownToConfluenceAdf, prependWarningBanner } from './markdown';

const syncDocumentationToConfluence = async () => {
  const documents = await discoverConfluenceDocuments(process.cwd());

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
