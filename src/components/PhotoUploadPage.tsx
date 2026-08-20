import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ExternalLink, Sparkles, FolderHeart, Image as ImageIcon, X, CheckCircle2, ArrowLeft, Camera, ShieldCheck } from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData';
import { OrnamentalDivider } from './MandalaPattern';

interface PhotoUploadPageProps {
  onBackToHome?: () => void;
}

export const PhotoUploadPage: React.FC<PhotoUploadPageProps> = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFileIdx, setCurrentFileIdx] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const folderId = '1SmRzW3JpwfkYwQ_hEF9Cr5k7_KVKWUZR';
  const details = WEDDING_DETAILS as Record<string, any>;

  const driveUrl = details.sharedDriveUrl || `https://drive.google.com/drive/folders/${folderId}?usp=sharing`;
  const webhookUrl = details.googleScriptWebhookUrl || 'https://script.google.com/macros/s/AKfycbzo57ci0SO2uI9rH5phtFFxCI6gS82lTRmn0pY-b4YK5dRpJdmk0KKImmYE9YNCLOekfQ/exec';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setUploadSuccess(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFileToWebhook = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resultStr = reader.result as string;
          const base64Data = resultStr.split(',')[1];
          const payload = {
            filename: file.name,
            mimeType: file.type || 'image/jpeg',
            base64: base64Data,
          };

          await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          resolve();
        } catch (err) {
          console.error('Upload error:', err);
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(5);

    for (let i = 0; i < selectedFiles.length; i++) {
      setCurrentFileIdx(i + 1);
      const file = selectedFiles[i];
      try {
        await uploadFileToWebhook(file);
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      } catch (e) {
        console.error('Failed file:', file.name, e);
      }
    }

    setIsUploading(false);
    setUploadSuccess(true);
    setSelectedFiles([]);
  };

  return (
    <div className="min-h-[85vh] bg-[#FAF6F0] py-12 px-4 relative z-20 font-sans flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto">

        {/* Dedicated Page Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#FFFDF9]/95 border-2 border-[#D4AF37] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-md text-center"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#D4AF37]/20 to-transparent blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-radial from-[#008070]/15 to-transparent blur-3xl pointer-events-none rounded-full" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4EDE2] text-[#0A4A40] border border-[#D4AF37]/60 text-xs font-serif font-bold tracking-[0.25em] uppercase mb-4 shadow-xs">
            <FolderHeart size={16} className="text-[#D4AF37]" />
            <span>Share your best clicks of our wedding</span>
            <Sparkles size={14} className="text-[#008070]" />
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0A4A40] tracking-tight">
            Guest Photo & Video Upload
          </h1>
          <p className="mt-3 text-xs sm:text-base text-[#2D3748]/85 max-w-2xl mx-auto font-medium leading-relaxed">
            Captured special moments during Arjun & Kanishka&apos;s wedding celebrations? Select your photos below to upload them directly into our official Google Drive album!
          </p>

          <OrnamentalDivider className="max-w-md mx-auto my-6" />

          {/* Large Dropzone & File Selector */}
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FAF6F0] border-2 border-dashed border-[#D4AF37]/70 hover:border-[#D4AF37] transition-all flex flex-col items-center justify-center text-center relative max-w-2xl mx-auto shadow-inner">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="dedicated-photo-upload-input"
            />

            <div className="w-20 h-20 rounded-full bg-[#FFFDF9] border border-[#D4AF37]/60 flex items-center justify-center text-[#0A4A40] mb-4 shadow-lg">
              <ImageIcon size={38} className="text-[#008070]" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#0A4A40]">
              Select Photos & Videos
            </h3>
            <p className="text-xs text-[#2D3748]/70 mt-1 max-w-sm">
              Files chosen here are uploaded directly into Google Drive with 0 tabs opening.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-widest shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer border border-[#B38728]/40"
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
                  className="mt-6 w-full p-4 rounded-2xl bg-green-50 border border-green-300 text-green-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
                >
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  <span>Success! Your photos are saved directly in Arjun & Kanishka&apos;s Google Drive album! 🎉</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Files Grid & Upload Progress Bar */}
            {selectedFiles.length > 0 && (
              <div className="mt-8 w-full text-left bg-[#FFFDF9] rounded-2xl p-5 border border-[#D4AF37]/40 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#0A4A40] uppercase tracking-wider mb-3 border-b border-[#D4AF37]/20 pb-2">
                  <span>Selected Files ({selectedFiles.length})</span>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="text-xs text-red-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/30 text-[#2D3748]"
                    >
                      <span className="truncate max-w-[260px] font-medium">{file.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-[#8C641D]">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-gray-500 hover:text-red-600 p-0.5 cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar during upload */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0A4A40] mb-1.5">
                      <span>Uploading File {currentFileIdx} of {selectedFiles.length} to Google Drive...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#F4EDE2] overflow-hidden">
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
                  className="mt-5 w-full py-3.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-widest shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={18} />
                  <span>{isUploading ? `Uploading File ${currentFileIdx} of ${selectedFiles.length}...` : `Send ${selectedFiles.length} File(s) Directly To Drive`}</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Security Note */}
          <div className="mt-8 pt-4 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#2D3748]/70">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#008070]" />
              <span>Direct secure transfer into Google Drive folder.</span>
            </div>
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A4A40] font-bold hover:text-[#008070] underline flex items-center gap-1"
            >
              <span>Open Google Drive Album</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
