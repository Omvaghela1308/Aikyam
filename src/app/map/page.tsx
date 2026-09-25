'use client';

import React from 'react';
import SubterraneanWorkerMap from '@/components/dashboard/SubterraneanWorkerMap';

export default function WorkerMapPage() {
  return (
    <div className="space-y-6 pb-12">
      <SubterraneanWorkerMap
        title="Worker Map"
        subtitle=""
        showAllWorkers={true}
      />
    </div>
  );
}
