import React from 'react';
import { VideoShowcaseModal } from '@/components/VideoShowcaseModal';

export function AstraCinematicDemo() {
  return (
    <div className="w-full h-full min-h-screen bg-black">
      <VideoShowcaseModal isStandalonePage={true} />
    </div>
  );
}

export default AstraCinematicDemo;
