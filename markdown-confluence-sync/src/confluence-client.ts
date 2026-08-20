interface ConfluencePage {
  version: { number: number };
}

interface UpdateConfluencePageInput {
  storage: string;
  title: string;
}

interface ConfluenceConfiguration {
  authorization: string;
  baseUrl: string;
}

const requiredEnvironmentVariables = [
  'CONFLUENCE_BASE_URL',
  'CONFLUENCE_EMAIL',
  'CONFLUENCE_API_TOKEN',
];

const getConfiguration = (): ConfluenceConfiguration => {
  for (const variable of requiredEnvironmentVariables) {
    if (!process.env[variable]) {
      throw new Error(`${variable} must be set before syncing Confluence documentation.`);
    }
  }

  const configuredBaseUrl = process.env.CONFLUENCE_BASE_URL;
  if (!configuredBaseUrl) {
    throw new Error('CONFLUENCE_BASE_URL must be set before syncing Confluence documentation.');
  }

  const baseUrl = new URL(configuredBaseUrl).origin;

  return {
    authorization: `Basic ${Buffer.from(
      `${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`,
    ).toString('base64')}`,
    baseUrl,
  };
};

const request = async <T>(requestPath: string, options: RequestInit = {}): Promise<T> => {
  const { authorization, baseUrl } = getConfiguration();
  const response = await fetch(`${baseUrl}/wiki/api/v2${requestPath}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: authorization,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 1_000);
    throw new Error(`Confluence API call failed (${response.status}): ${details}`);
  }

  return response.json() as Promise<T>;
};

export const updateConfluencePage = async (
  pageId: string,
  { storage, title }: UpdateConfluencePageInput,
): Promise<ConfluencePage> => {
  const page = await request<ConfluencePage>(`/pages/${encodeURIComponent(pageId)}`);

  return request<ConfluencePage>(`/pages/${encodeURIComponent(pageId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: pageId,
      status: 'current',
      title,
      version: { number: page.version.number + 1 },
      body: { representation: 'storage', value: storage },
    }),
  });
};
