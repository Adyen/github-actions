/* eslint-disable import/no-extraneous-dependencies */
import { describe, expect, it } from 'vitest';

import { markdownToConfluenceStorage } from './markdown';

describe('markdownToConfluenceStorage', () => {
  it('converts supported Markdown and escapes HTML', () => {
    const markdown = `# Title

## Heading

Paragraph with **bold**, *italic*, \`code\`, and <script>.

- First
- Second

\`\`\`ts
const value = '<safe>';
\`\`\``;

    expect(markdownToConfluenceStorage(markdown)).toEqual({
      title: 'Title',
      storage: `<h2>Heading</h2>
<p>Paragraph with <strong>bold</strong>, <em>italic</em>, <code>code</code>, and &lt;script&gt;.</p>
<ul><li>First</li><li>Second</li></ul>
<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[const value = '<safe>';]]></ac:plain-text-body></ac:structured-macro>`,
    });
  });
});
