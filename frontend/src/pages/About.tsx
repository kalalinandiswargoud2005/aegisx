import React from 'react';
import { Info, ShieldCheck } from 'lucide-react';
import { Card, Badge, PageContainer, PageHeader, PageSection } from '@/components/ui';

export function About() {
  return (
    <PageContainer>
      <PageHeader 
        title="About AEGISX" 
        description="Project details and licensing."
      />

      <PageSection>

      <Card className="max-w-3xl">
        <div className="flex items-center gap-4 border-b border-border-color pb-6 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary box-glow">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-space font-bold text-white">AEGISX Enterprise</h2>
            <p className="text-white/60">AI Powered Embedded Cybersecurity Security Appliance</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Version Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-white/50">Frontend UI</span>
                <span className="font-medium text-white">v1.0.0-rc.4</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/50">Core Engine</span>
                <span className="font-medium text-white">v2.1.0</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Technology Stack</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>React 19</Badge>
              <Badge>Vite</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Tailwind CSS v4</Badge>
              <Badge>Framer Motion</Badge>
              <Badge>Recharts</Badge>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-2">License</h3>
            <p className="text-sm text-white/70">
              Proprietary and Confidential. Unauthorized copying of this file, via any medium is strictly prohibited.
            </p>
          </div>
        </div>
      </Card>
      </PageSection>
    </PageContainer>
  );
}
