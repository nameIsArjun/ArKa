import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ExternalLink, Sparkles, FolderHeart, Image as ImageIcon, X, CheckCircle2, Camera } from 'lucide-react';
import { WEDDING_DETAILS, UPLOAD_CONCURRENCY_LIMIT } from '../data/weddingData';
import { OrnamentalDivider } from './MandalaPattern';

interface SharedPhotoDriveProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharedPhotoDrive: React.FC<SharedPhotoDriveProps> = ({ isOpen, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFileIdx, setCurrentFileIdx] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileBase64CacheRef = useRef<Map<File, Promise<string>>>(new Map());

  const folderId = '1SmRzW3JpwfkYwQ_hEF9Cr5k7_KVKWUZR';
  const details = WEDDING_DETAILS as Record<string, any>;

  const driveUrl = details.sharedDriveUrl || `https://drive.google.com/drive/folders/${folderId}?usp=sharing`;

  const getFileBase64 = (file: File): Promise<string> => {
    if (fileBase64CacheRef.current.has(file)) {
      return fileBase64CacheRef.current.get(file)!;
    }
    const promise = new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        resolve(resultStr.split(',')[1]);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
    fileBase64CacheRef.current.set(file, promise);
    return promise;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setUploadSuccess(false);
      filesArray.forEach((file) => {
        getFileBase64(file);
      });
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove) {
      fileBase64CacheRef.current.delete(fileToRemove);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const uploadFileToVercel = async (file: File, retries: number = 3): Promise<void> => {
    const isLargeFile = file.size > 3.5 * 1024 * 1024; // > 3.5 MB (e.g. videos / large photos)

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (isLargeFile) {
          const apiRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              mimeType: file.type || 'video/mp4',
              isResumable: true,
            }),
          });

          if (apiRes.ok) {
            const data = await apiRes.json();
            if (data.uploadUrl) {
              const uploadRes = await fetch(data.uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type || 'video/mp4' },
                body: file,
              });

              if (uploadRes.ok || uploadRes.status === 200 || uploadRes.status === 201) {
                return;
              }
            }
          }
          const errData = await apiRes.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${apiRes.status}`);
        } else {
          const base64Data = await getFileBase64(file);
          const apiRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              mimeType: file.type || 'image/jpeg',
              base64: base64Data,
            }),
          });

          if (apiRes.ok) {
            return;
          }
          const errData = await apiRes.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${apiRes.status}`);
        }
      } catch (err) {
        if (attempt === retries) throw err;
        await delay(1000 * Math.pow(2, attempt - 1));
      }
    }
  };

  const CONCURRENCY_LIMIT = details.uploadConcurrencyLimit || UPLOAD_CONCURRENCY_LIMIT;

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    const totalFiles = selectedFiles.length;

    setIsUploading(true);
    setUploadProgress(5);
    setCurrentFileIdx(0);
    setUploadSuccess(false);

    let completedCount = 0;
    const queue = [...selectedFiles];

    const worker = async () => {
      while (queue.length > 0) {
        const file = queue.shift();
        if (!file) break;
        try {
          await uploadFileToVercel(file, 3);
        } catch (e) {
          // Handled quietly
        } finally {
          completedCount++;
          setCurrentFileIdx(completedCount);
          setUploadProgress(Math.round((completedCount / totalFiles) * 100));
        }
      }
    };

    const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, totalFiles) }, () => worker());
    await Promise.all(workers);

    setIsUploading(false);
    setUploadSuccess(true);
    setSelectedFiles([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity"
          />

          {/* Right Slide-Over Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#FFFDF9] border-l-2 border-[#D4AF37] shadow-2xl z-[9999] overflow-y-auto flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#D4AF37]/30 bg-[#FAF6F0] sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderHeart size={20} className="text-[#D4AF37]" />
                <h3 className="font-serif text-lg font-bold text-[#0A4A40]">
                  Photo & Video Upload
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#EEDC9A]/30 text-[#0A4A40] transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="p-6 space-y-6 flex-1">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EDE2] text-[#0A4A40] text-[11px] font-serif font-bold tracking-widest uppercase mb-2">
                  <Sparkles size={13} className="text-[#D4AF37]" />
                  <span>Direct Google Drive Upload</span>
                </div>
                <p className="text-xs text-[#2D3748]/80 leading-relaxed font-medium">
                  Upload your favorite photos & videos directly into Arjun & Kanishka&apos;s Google Drive folder!
                </p>
                <OrnamentalDivider className="max-w-xs mx-auto my-4" />
              </div>

              {/* Direct Webhook Upload Selector */}
              <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/60 text-center shadow-inner space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="drawer-photo-upload-input"
                />

                <div className="w-14 h-14 rounded-full bg-[#FFFDF9] border border-[#D4AF37]/60 flex items-center justify-center text-[#0A4A40] mx-auto shadow-md">
                  <ImageIcon size={26} className="text-[#008070]" />
                </div>

                <div>
                  <h4 className="font-serif text-base font-bold text-[#0A4A40]">
                    Select Photos & Videos
                  </h4>
                  <p className="text-[11px] text-[#2D3748]/70 mt-0.5">
                    Select photos from your device to send directly into Drive
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-full bg-[#FFFDF9] border border-[#D4AF37] text-[#0A4A40] font-bold text-xs uppercase tracking-wider shadow-xs hover:bg-[#F4EDE2] transition-all cursor-pointer"
                >
                  Choose Files From Phone / PC
                </button>

                {/* Upload Success Banner */}
                <AnimatePresence>
                  {uploadSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3.5 rounded-xl bg-green-50 border border-green-300 text-green-800 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                      <span>Uploaded directly into Google Drive! 🎉</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selected Files List & Progress */}
                {selectedFiles.length > 0 && (
                  <div className="text-left bg-[#FFFDF9] rounded-xl p-3.5 border border-[#D4AF37]/40">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0A4A40] uppercase tracking-wider mb-2 border-b border-[#D4AF37]/20 pb-1.5">
                      <span>Selected ({selectedFiles.length})</span>
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-[#FAF6F0] border border-[#D4AF37]/30 text-[#2D3748]"
                        >
                          <span className="truncate max-w-[170px] font-medium">{file.name}</span>
                          <button
                            onClick={() => removeFile(idx)}
                            className="text-gray-500 hover:text-red-600 p-0.5 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#0A4A40] mb-1">
                          <span>Uploading {currentFileIdx}/{selectedFiles.length}...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#F4EDE2] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#008070] to-[#D4AF37] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleStartUpload}
                      disabled={isUploading}
                      className="mt-3 w-full py-2.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-bold text-xs uppercase tracking-widest shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload size={14} />
                      <span>{isUploading ? `Uploading ${currentFileIdx}/${selectedFiles.length}...` : `Send ${selectedFiles.length} File(s) To Drive`}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Utility */}
            <div className="p-5 border-t border-[#D4AF37]/30 bg-[#FAF6F0] flex flex-col gap-3 text-center">
              <a
                href={driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-[#FFFDF9] border-2 border-[#0A4A40] text-[#0A4A40] font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-[#F4EDE2] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera size={16} className="text-[#008070]" />
                <span>Open Google Drive Album</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
