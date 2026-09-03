import React from 'react';
import { X, FileText, Download, FileCheck, Eye, Calendar, HardDrive, Shield } from 'lucide-react';
import { SupportingDocument } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';

interface DocumentViewerModalProps {
  document: SupportingDocument | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: doc,
  onClose,
}) => {
  if (!doc) return null;

  const handleDownload = () => {
    if (doc.dataUrl) {
      const a = document.createElement('a');
      a.href = doc.dataUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create simulated downloadable text blob for demo docs
      const content = `Hospital Biomedical Document Management System (HBDMS)\r\nDocument: ${doc.name}\r\nCategory: ${doc.category}\r\nUpload Date: ${doc.uploadedAt}\r\nStatus: Official Verified Biomedical Record\r\n\r\n[Hospital Medical Equipment Record Verification Stamp]`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name.endsWith('.pdf') ? doc.name.replace('.pdf', '_Report.txt') : doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supporting Document Viewer</h3>
              <p className="text-[11px] text-slate-500">{doc.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-slate-900 truncate" title={doc.name}>
                  {doc.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{doc.category}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">File Size:</span>
                <span className="font-medium text-slate-700">{formatFileSize(doc.fileSize)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">File Format:</span>
                <span className="font-medium text-slate-700">{doc.fileType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Upload Timestamp:</span>
                <span className="font-medium text-slate-700">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Security Clearance:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <Shield className="w-3 h-3" /> Verified & Archived
                </span>
              </div>
            </div>
          </div>

          {/* Preview Placeholder / Image Preview */}
          {doc.dataUrl && doc.fileType.startsWith('image/') ? (
            <div className="rounded-xl overflow-hidden border border-slate-200 max-h-60 flex items-center justify-center bg-slate-900">
              <img
                src={doc.dataUrl}
                alt={doc.name}
                className="max-h-60 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center space-y-2 bg-slate-50/50">
              <FileCheck className="w-8 h-8 text-teal-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-800">
                Official Hospital Biomedical Attachment
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Digitally archived in compliance with medical equipment regulatory standards. Click below to download or view offline.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Document
          </button>
        </div>
      </div>
    </div>
  );
};
