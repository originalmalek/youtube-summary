import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';

type Props = {
  params: { shareId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = params;

  try {
    // Fetch summary data for dynamic metadata
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/share/${shareId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      // Fallback metadata if share not found
      return generateSEOMetadata({
        title: 'Shared Summary - YouTube Summary',
        description: 'View this shared AI-powered summary on YouTube Summary platform.',
        url: `/share/${shareId}`,
      });
    }

    const data = await response.json();

    // Extract first 150 characters for description
    const summaryPreview = data.summary_text
      ? data.summary_text.substring(0, 150).replace(/\n/g, ' ').trim() + '...'
      : 'View this AI-powered summary';

    const summaryType = data.summary_type === 'youtube' ? 'YouTube Video' :
                       data.summary_type === 'file' ? 'Document' : 'Content';

    const title = `${summaryType} Summary`;

    return generateSEOMetadata({
      title,
      description: summaryPreview,
      url: `/share/${shareId}`,
      keywords: [
        'shared summary',
        'AI summary',
        data.summary_type === 'youtube' ? 'YouTube summary' : 'document summary',
        data.format_type,
        'video summary',
        'content summary',
      ],
      type: 'article',
      publishedTime: data.created_at,
    });
  } catch (error) {
    console.error('Error generating share metadata:', error);

    // Fallback metadata
    return generateSEOMetadata({
      title: 'Shared Summary - YouTube Summary',
      description: 'View this shared AI-powered summary on YouTube Summary platform.',
      url: `/share/${shareId}`,
    });
  }
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
