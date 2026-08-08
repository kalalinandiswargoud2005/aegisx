import React from 'react';
import { Activity, Play, Square, Zap } from 'lucide-react';
import { Card, Button, PageContainer, PageHeader, PageSection } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export function Simulation() {
  const { data: scenarios, isLoading } = useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const res = await api.get('/simulation/scenarios');
      return res.data;
    }
  });

  return (
    <PageContainer>
      <PageHeader 
        title="Threat Simulator" 
        description="Generate and test AI-backed security incidents."
      />

      <PageSection>

      <Card className="border-primary/30 bg-primary/5">
        <h3 className="mb-4 text-lg font-medium text-white border-b border-border-color pb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Enterprise Threat Simulation Engine
        </h3>
        <p className="text-sm text-white/70 mb-6">
          Control the Enterprise Threat Simulation Engine for demonstrations and testing. Activating Continuous Demo Mode will generate AI-backed security incidents every 15 seconds.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="primary" 
            className="flex items-center gap-2"
            onClick={async () => {
              try {
                await api.post('/simulation/demo/start');
                toast.success('Simulation Engine Started');
              } catch (e) {
                toast.error('Failed to start Simulation Engine');
              }
            }}
          >
            <Play size={16} />
            Start Continuous Simulation
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={async () => {
              try {
                await api.post('/simulation/demo/stop');
                toast.info('Simulation Engine Stopped');
              } catch (e) {
                toast.error('Failed to stop Simulation Engine');
              }
            }}
          >
            <Square size={16} />
            Stop Simulation
          </Button>
          <Button 
            variant="outline"
            className="border-danger/50 text-danger hover:bg-danger/10 flex items-center gap-2"
            onClick={async () => {
              try {
                await api.post('/simulation/trigger/random');
                toast.success('Triggered random scenario');
              } catch (e) {
                toast.error('Failed to trigger scenario');
              }
            }}
          >
            <Zap size={16} />
            Trigger Single Threat
          </Button>
        </div>
      </Card>
      </PageSection>
      
      <PageSection>
      <Card>
        <h3 className="mb-4 text-lg font-medium text-white border-b border-border-color pb-2">Threat Library ({scenarios?.length || 0})</h3>
        <p className="text-sm text-white/70 mb-4">
          Manually trigger specific high-level threat scenarios for testing and demonstration purposes.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center p-8 text-primary">
            <span className="animate-pulse">Loading scenarios...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios?.map((scenario: any) => (
              <div key={scenario.threatId} className="bg-surface/50 border border-border-color rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium text-sm truncate pr-2" title={scenario.threatName}>{scenario.threatName}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      scenario.severity === 'CRITICAL' ? 'bg-danger/20 text-danger border border-danger/30' :
                      scenario.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                      scenario.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                      'bg-primary/20 text-primary border border-primary/30'
                    }`}>
                      {scenario.severity}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs mb-2">{scenario.category}</p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-4 flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-colors"
                  onClick={async () => {
                    try {
                      await api.post(`/simulation/trigger/${scenario.threatId}`);
                      toast.success(`Triggered: ${scenario.threatName}`);
                    } catch (e) {
                      toast.error('Failed to trigger scenario');
                    }
                  }}
                >
                  <Zap size={14} />
                  Trigger Threat
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
      </PageSection>

      <PageSection>
        <Card>
        <h3 className="mb-4 text-lg font-medium text-white border-b border-border-color pb-2">How it works</h3>
        <div className="space-y-4 text-sm text-white/70">
          <p>The Simulation Engine bypasses real hardware endpoints and directly injects synthetically generated security incidents into the platform.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Continuous Simulation:</strong> Automatically picks a random threat scenario from the Threat Library every 15 seconds and dispatches it over WebSockets.</li>
            <li><strong>Single Threat:</strong> Instantly fires one random scenario for immediate testing.</li>
            <li><strong>Manual Trigger:</strong> Use the Threat Library below to trigger a specific scenario.</li>
            <li><strong>Data Flow:</strong> Events are pushed to the live timeline on the Threat Center and stored in the PostgreSQL database for analytics.</li>
          </ul>
        </div>
        </Card>
      </PageSection>
    </PageContainer>
  );
}
