import { redirect } from 'next/navigation';

export default function EnvironmentSensorsPage() {
  redirect('/sensors?tab=environment');
}
