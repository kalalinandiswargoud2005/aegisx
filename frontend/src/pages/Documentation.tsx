import React from 'react';
import { BookOpen, Code, Cpu, Shield } from 'lucide-react';
import { Card, PageContainer, PageHeader, PageSection } from '@/components/ui';

export function Documentation() {
  return (
    <PageContainer>
      <PageHeader 
        title="Documentation" 
        description="Guides, APIs, and Architecture."
      />

      <PageSection className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield size={24} />
          </div>
          <h3 className="text-lg font-medium text-white">Getting Started</h3>
          <p className="mt-2 text-sm text-white/60">Initial setup, appliance deployment, and agent installation.</p>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Cpu size={24} />
          </div>
          <h3 className="text-lg font-medium text-white">System Architecture</h3>
          <p className="mt-2 text-sm text-white/60">Windows Agent → Spring Boot Backend → Dashboard Kiosk.</p>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <Code size={24} />
          </div>
          <h3 className="text-lg font-medium text-white">API Reference</h3>
          <p className="mt-2 text-sm text-white/60">REST and GraphQL API documentation for custom integrations.</p>
        </Card>
      </PageSection>
    </PageContainer>
  );
}
