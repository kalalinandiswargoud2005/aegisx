import React, { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { Card, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, PageContainer, PageHeader, PageSection } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';


export function Reports() {
  const [isExporting, setIsExporting] = useState(false);
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await api.get('/reports');
      return res.data;
    }
  });

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const response = await api.get('/reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'astra-threat-scenarios.json');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Reports"
        description="Automated and custom compliance reports."
      >
        <Button variant="primary" onClick={handleExportJSON} disabled={isExporting}>
          {isExporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
          Export Scenarios
        </Button>
      </PageHeader>

      <PageSection>
        <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Generated</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {isLoading ? (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </motion.tr>
              ) : (
                reports.map((report: any) => (
                  <motion.tr 
                    key={report.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-border-color transition-colors hover:bg-white/5"
                  >
                    <TableCell className="font-mono font-bold text-white tracking-widest">{report.name}</TableCell>
                    <TableCell className="text-white/70 font-mono text-sm">{report.type}</TableCell>
                    <TableCell className="text-white/70 font-mono text-sm">{report.date}</TableCell>
                    <TableCell className="text-white/70 font-mono text-sm">{report.size}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={report.isStatic ? () => toast.info('Static reports are disabled in demo mode') : handleExportJSON}
                      >
                        <Download size={16} />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Card>
      </PageSection>
    </PageContainer>
  );
}
