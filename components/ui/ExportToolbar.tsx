'use client';

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileJson, FileCode, Image as ImageIcon, FileText } from 'lucide-react';
import { FlowchartModel } from '@/lib/types';
import { exportToFprg } from '@/lib/exporters/fprg';
import { exportToJson } from '@/lib/exporters/json';
import { exportImage } from '@/lib/exporters/image';
import { exportToPdf } from '@/lib/exporters/pdf';

interface ExportToolbarProps {
  flowchart: FlowchartModel;
  canvasRef: React.RefObject<HTMLElement>;
}

export default function ExportToolbar({ flowchart, canvasRef }: ExportToolbarProps) {
  const { t } = useTranslation();

  const handleExport = async (format: 'fprg' | 'json' | 'svg' | 'png' | 'jpg' | 'pdf') => {
    if (format === 'json') {
      exportToJson(flowchart);
      return;
    }

    if (format === 'fprg') {
      exportToFprg(flowchart);
      return;
    }

    const element = canvasRef.current;
    if (!element) return;

    if (format === 'pdf') {
      await exportToPdf(element);
      return;
    }

    await exportImage(element, format);
  };

  const buttons: { format: 'fprg' | 'json' | 'svg' | 'png' | 'jpg' | 'pdf'; label: string; icon: React.ReactNode }[] = [
    { format: 'fprg', label: t('exportFprg') as string, icon: <FileCode size={16} /> },
    { format: 'json', label: t('exportJson') as string, icon: <FileJson size={16} /> },
    { format: 'svg', label: t('exportSvg') as string, icon: <ImageIcon size={16} /> },
    { format: 'png', label: t('exportPng') as string, icon: <ImageIcon size={16} /> },
    { format: 'jpg', label: t('exportJpg') as string, icon: <ImageIcon size={16} /> },
    { format: 'pdf', label: t('exportPdf') as string, icon: <FileText size={16} /> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
        <Download size={16} />
        {t('export')}
      </span>
      {buttons.map((btn) => (
        <button
          key={btn.format}
          onClick={() => handleExport(btn.format)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-1"
        >
          {btn.icon}
          {btn.label}
        </button>
      ))}
    </div>
  );
}
