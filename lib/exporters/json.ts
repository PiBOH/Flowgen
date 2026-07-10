import { FlowchartModel } from '@/lib/types';

export function exportToJson(flowchart: FlowchartModel, filename = 'flowchart.json') {
  const blob = new Blob([JSON.stringify(flowchart, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
