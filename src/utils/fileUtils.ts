import { SupportingDocument } from '../types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function processUploadedFiles(
  files: FileList | File[],
  category: string
): Promise<SupportingDocument[]> {
  const docs: SupportingDocument[] = [];
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    // Validate size: max 15MB
    if (file.size > 15 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds 15MB size limit and was skipped.`);
      continue;
    }

    let dataUrl: string | undefined;
    try {
      if (file.size < 4 * 1024 * 1024) {
        // Only convert to base64 if under 4MB for localStorage comfort
        dataUrl = await readFileAsDataURL(file);
      }
    } catch (e) {
      console.warn('Could not read file data', e);
    }

    docs.push({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      category: category || 'Supporting Document',
      dataUrl,
    });
  }

  return docs;
}
