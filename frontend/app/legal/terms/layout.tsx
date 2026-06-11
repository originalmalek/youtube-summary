import { generateDynamicSEO } from '@/lib/seo';

export const metadata = generateDynamicSEO('termsOfService');

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
