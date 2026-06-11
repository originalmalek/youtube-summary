import { generateDynamicSEO } from '@/lib/seo';

export const metadata = generateDynamicSEO('login');

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
