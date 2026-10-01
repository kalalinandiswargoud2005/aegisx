import React from 'react';
import { CollegeLogoShowcaseModal } from '@/components/CollegeLogoShowcaseModal';

export function CollegeLogoPage() {
  return (
    <div className="w-full h-full min-h-screen">
      <CollegeLogoShowcaseModal isStandalonePage={true} />
    </div>
  );
}

export default CollegeLogoPage;
