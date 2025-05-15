import { NextRequest, NextResponse } from 'next/server';
import { createAppAuth } from '@octokit/auth-app';

const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY;
const GITHUB_APP_CLIENT_ID = process.env.GITHUB_APP_CLIENT_ID;
const GITHUB_APP_CLIENT_SECRET = process.env.GITHUB_APP_CLIENT_SECRET;

// API route to handle GitHub App authentication
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { code, installation_id } = data;

    if (!code) {
      return NextResponse.json({ error: 'Code parameter is required' }, { status: 400 });
    }

    if (
      !GITHUB_APP_ID ||
      !GITHUB_APP_CLIENT_ID ||
      !GITHUB_APP_CLIENT_SECRET ||
      !GITHUB_APP_PRIVATE_KEY
    ) {
      console.error('GitHub App credentials are not configured');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Exchange code for token using GitHub App OAuth flow
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_APP_CLIENT_ID,
        client_secret: GITHUB_APP_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub App OAuth error:', tokenData);
      return NextResponse.json(
        { error: tokenData.error_description || 'Failed to exchange code for token' },
        { status: 400 },
      );
    }

    // If installation_id is provided, we can also get an installation token
    let installationToken = null;
    if (installation_id) {
      try {
        const auth = createAppAuth({
          appId: GITHUB_APP_ID,
          privateKey: GITHUB_APP_PRIVATE_KEY,
          clientId: GITHUB_APP_CLIENT_ID,
          clientSecret: GITHUB_APP_CLIENT_SECRET,
        });

        const installationAuthentication = await auth({
          type: 'installation',
          installationId: installation_id,
        });

        installationToken = installationAuthentication.token;
      } catch (error) {
        console.error('Error getting installation token:', error);
        // Continue without installation token
      }
    }

    // Return the access token and installation token if available
    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      installation_token: installationToken,
    });
  } catch (error) {
    console.error('Error handling GitHub App auth:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
