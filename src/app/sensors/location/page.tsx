import { redirect } from 'next/navigation';

export default function LocationSensorsPage() {
  redirect('/sensors?tab=location');
}
