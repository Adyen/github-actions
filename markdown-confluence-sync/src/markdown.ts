const escapeHtml = (value: string) => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
};

const markdownInlineToStorage = (markdown: string) => {
  let storage = escapeHtml(markdown);

  storage = storage.replaceAll(/`([^`]+)`/g, '<code>$1</code>');
  storage = storage.replaceAll(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  storage = storage.replaceAll(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  storage = storage.replaceAll(/__([^_]+)__/g, '<strong>$1</strong>');
  storage = storage.replaceAll(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  storage = storage.replaceAll(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');

  return storage;
};

const extractMarkdownTitle = (markdown: string, fallbackTitle: string) => {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallbackTitle;
};

export const markdownToConfluenceStorage = (markdown: string) => {
  const title = extractMarkdownTitle(markdown, 'Untitled documentation');
  const lines = markdown.replace(/^\s*#\s+.+\r?\n?/, '').split(/\r?\n/);
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const codeFence = line.match(/^```(?:\w+)?$/);

    if (codeFence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      output.push(
        `<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[${codeLines.join('\n')}]]></ac:plain-text-body></ac:structured-macro>`,
      );
      continue;
    }

    const heading = line.match(/^(#{2,6})\s+(.+)$/);
    if (heading) {
      output.push(
        `<h${heading[1].length}>${markdownInlineToStorage(heading[2])}</h${heading[1].length}>`,
      );
      continue;
    }

    const list = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
    if (list) {
      const ordered = /\d+\./.test(list[2]);
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        if (!item || /\d+\./.test(item[2]) !== ordered) break;
        items.push(`<li>${markdownInlineToStorage(item[3])}</li>`);
        index += 1;
      }
      index -= 1;
      output.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }

    if (!line.trim()) continue;

    output.push(`<p>${markdownInlineToStorage(line)}</p>`);
  }

  return { title, storage: output.join('\n') };
};
