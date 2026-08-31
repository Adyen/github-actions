import { markdownToAdf } from 'marklassian';

export type AdfDocument = ReturnType<typeof markdownToAdf>;

const stripCode = (markdown: string) =>
  markdown
    .replace(/(`{3,}|~{3,})[^\n]*\n[\s\S]*?\1/g, '')
    .replace(/`[^`]*`/g, '');

const ensureNoUnsupportedHtml = (markdown: string) => {
  const unsupportedHtml = stripCode(markdown).match(
    /<(?!\/?adf(?:\s|>))(?:\/?[a-z][^>]*|!--[\s\S]*?--|![^>]+)>/i,
  );

  if (unsupportedHtml) {
    throw new Error(
      `Raw HTML is not supported in Confluence Markdown. Use Markdown or an <adf> block instead: ${unsupportedHtml[0]}`,
    );
  }
};

export const markdownToConfluenceAdf = (markdown: string): AdfDocument => {
  ensureNoUnsupportedHtml(markdown);

  return markdownToAdf(markdown.replace(/^\s*#\s+.+\r?\n?/, ''));
};

export const prependWarningBanner = (document: AdfDocument, banner: string): AdfDocument => ({
  ...document,
  content: [
    {
      type: 'panel',
      attrs: { panelType: 'warning' },
      content: markdownToAdf(banner).content,
    },
    ...document.content,
  ],
});
