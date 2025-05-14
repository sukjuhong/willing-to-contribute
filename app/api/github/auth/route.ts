import { NextRequest, NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// API route to exchange GitHub code for an access token
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { code } = data;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      );
    }
    
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      console.error('GitHub OAuth credentials are not configured');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }
    
    // Exchange code for token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData);
      return NextResponse.json(
        { error: tokenData.error_description || 'Failed to exchange code for token' },
        { status: 400 }
      );
    }
    
    // Return the access token
    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    });
  } catch (error) {
    console.error('Error handling GitHub auth:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 