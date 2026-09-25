import { redirect } from 'next/navigation';

export default function GasSensorsPage() {
  redirect('/sensors?tab=gas');
}
