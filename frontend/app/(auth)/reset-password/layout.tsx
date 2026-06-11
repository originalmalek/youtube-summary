import { generateDynamicSEO } from '@/lib/seo';

export const metadata = generateDynamicSEO('resetPassword');

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
