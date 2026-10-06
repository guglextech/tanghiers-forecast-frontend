import type { Metadata } from 'next';
import { AppFrame } from '@/components/chrome/Frames';
import { ForecastScreen } from '@/components/forecast/Screens';

export const metadata: Metadata = {
  title: 'Forecast',
  robots: { index: false, follow: false },
};

export default async function ForecastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppFrame>
      <ForecastScreen id={id} />
    </AppFrame>
  );
}
