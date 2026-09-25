import { redirect } from 'next/navigation';

export default function RadiationSensorsPage() {
  redirect('/sensors?tab=radiation');
}
