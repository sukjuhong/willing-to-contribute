import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

let cachedOctokit: Octokit | null = null;
let cacheExpiresAt = 0;

export async function getServerOctokit(): Promise<Octokit> {
  if (cachedOctokit && Date.now() < cacheExpiresAt) {
    return cachedOctokit;
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

  if (!appId || !privateKey || !installationId) {
    throw new Error(
      'Missing required GitHub App environment variables: GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, GITHUB_APP_INSTALLATION_ID',
    );
  }

  // Vercel stores multiline env vars with literal \n - convert to real newlines
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  const auth = createAppAuth({
    appId,
    privateKey: formattedKey,
    installationId: Number(installationId),
  });
  const { token } = await auth({ type: 'installation' });
  cachedOctokit = new Octokit({ auth: token });
  cacheExpiresAt = Date.now() + 50 * 60 * 1000; // 50 min (tokens expire in 1h)
  return cachedOctokit;
}
