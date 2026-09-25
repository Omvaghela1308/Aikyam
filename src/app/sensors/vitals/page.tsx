import { redirect } from 'next/navigation';

export default function VitalsSensorsPage() {
  redirect('/sensors?tab=vitals');
}
