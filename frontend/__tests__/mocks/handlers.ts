import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    
    if (body.username === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
      });
    }
    
    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    
    if (body.username === 'existing@example.com') {
      return HttpResponse.json(
        { detail: 'User already exists' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      id: 'mock-user-id',
      username: body.username,
      email_confirmed: false,
      created_at: new Date().toISOString(),
    });
  }),

  http.post(`${API_URL}/auth/refresh`, async ({ request }) => {
    const body = await request.json() as { refresh_token: string };
    
    if (body.refresh_token === 'mock-refresh-token') {
      return HttpResponse.json({
        access_token: 'mock-new-access-token',
        refresh_token: 'mock-new-refresh-token',
        token_type: 'bearer',
      });
    }
    
    return HttpResponse.json(
      { detail: 'Invalid refresh token' },
      { status: 401 }
    );
  }),

  // User endpoints
  http.get(`${API_URL}/user/me`, () => {
    const authHeader = http.headers.get('Authorization');
    
    if (authHeader === 'Bearer mock-access-token') {
      return HttpResponse.json({
        id: 'mock-user-id',
        username: 'test@example.com',
        email_confirmed: true,
        created_at: new Date().toISOString(),
      });
    }
    
    return HttpResponse.json(
      { detail: 'Not authenticated' },
      { status: 401 }
    );
  }),

  // Summary endpoints
  http.get(`${API_URL}/summary/summary_youtube`, ({ request }) => {
    const url = new URL(request.url);
    const youtubeUrl = url.searchParams.get('youtube_url');
    
    if (!youtubeUrl) {
      return HttpResponse.json(
        { detail: 'YouTube URL is required' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      summary_id: 'mock-summary-id',
      summary_text: '## Summary\n\nThis is a mock summary of the YouTube video.',
      language: 'ru',
      created_at: new Date().toISOString(),
      summary_type: 'youtube',
      format_type: 'standard',
      source_url: youtubeUrl,
    });
  }),

  http.get(`${API_URL}/summary/summaries`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';
    
    return HttpResponse.json({
      summaries: [
        {
          id: 'summary-1',
          summary_text: 'First summary text',
          summary_type: 'youtube',
          format_type: 'standard',
          language: 'ru',
          created_at: new Date().toISOString(),
          status: status,
          source_url: 'https://youtube.com/watch?v=123',
        },
        {
          id: 'summary-2',
          summary_text: 'Second summary text',
          summary_type: 'file',
          format_type: 'bullets',
          language: 'en',
          created_at: new Date().toISOString(),
          status: status,
        },
      ],
      total: 2,
      has_next: false,
    });
  }),

  // Format endpoints
  http.get(`${API_URL}/summary/formats`, () => {
    return HttpResponse.json([
      {
        name: 'standard',
        displayName: 'Standard',
        description: 'Comprehensive summary with key points',
        icon: 'FileText',
      },
      {
        name: 'bullets',
        displayName: 'Bullet Points',
        description: 'Concise bullet-point format',
        icon: 'List',
      },
      {
        name: 'takeaways',
        displayName: 'Key Takeaways',
        description: 'Main insights and conclusions',
        icon: 'Lightbulb',
      },
    ]);
  }),
];