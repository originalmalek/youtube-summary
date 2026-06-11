import { generateDynamicSEO } from '@/lib/seo';

export const metadata = generateDynamicSEO('cookiePolicy');

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
