import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ExternalLink, Sparkles, Image as ImageIcon, X, CheckCircle2, Camera, ShieldCheck, Maximize2, Download } from 'lucide-react';
import { WEDDING_DETAILS, UPLOAD_CONCURRENCY_LIMIT } from '../data/weddingData';

interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  isPolaroid?: boolean;
}

const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [];

export const PhotoUploadPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localPreviews, setLocalPreviews] = useState<GalleryPhoto[]>(DEFAULT_GALLERY_PHOTOS);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFileIdx, setCurrentFileIdx] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState<GalleryPhoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileBase64CacheRef = useRef<Map<File, Promise<string>>>(new Map());

  const folderId = '1SmRzW3JpwfkYwQ_hEF9Cr5k7_KVKWUZR';
  const details = WEDDING_DETAILS as Record<string, any>;
  const driveUrl = details.sharedDriveUrl || `https://drive.google.com/drive/folders/${folderId}?usp=sharing`;

  const fetchDrivePhotos = async () => {
    try {
      const res = await fetch('/api/upload?action=list');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.files) && data.files.length > 0) {
          const drivePhotos: GalleryPhoto[] = data.files.map((file: any, idx: number) => ({
            id: file.id,
            url: file.thumbnailUrl || file.fullUrl,
            caption: file.name,
            isPolaroid: idx % 4 === 0,
          }));
          setLocalPreviews(drivePhotos);
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching Google Drive photos:', e);
    }
  };

  React.useEffect(() => {
    fetchDrivePhotos();
  }, []);

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
      setUploadError(null);

      // Create local object URL previews for instant photo grid display
      const newPhotoObjects: GalleryPhoto[] = filesArray.map((file, idx) => ({
        id: `upload-${Date.now()}-${idx}`,
        url: URL.createObjectURL(file),
        caption: file.name,
        isPolaroid: idx % 4 === 0,
      }));

      setLocalPreviews((prev) => [...newPhotoObjects, ...prev]);

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
    const isLargeFile = file.size > 2.5 * 1024 * 1024;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (isLargeFile) {
          const startRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'start',
              filename: file.name,
              mimeType: file.type || 'application/octet-stream',
            }),
          });

          if (!startRes.ok) {
            const errData = await startRes.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${startRes.status}`);
          }

          const { uploadUrl } = await startRes.json();
          if (!uploadUrl) throw new Error('No uploadUrl returned from server');

          const CHUNK_SIZE = 2.5 * 1024 * 1024;
          const totalSize = file.size;
          let offset = 0;

          while (offset < totalSize) {
            const end = Math.min(offset + CHUNK_SIZE, totalSize);
            const blobChunk = file.slice(offset, end);

            const chunkBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blobChunk);
            });

            const contentRange = `bytes ${offset}-${end - 1}/${totalSize}`;
            const chunkRes = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'chunk',
                uploadUrl,
                chunkBase64,
                contentRange,
                mimeType: file.type || 'application/octet-stream',
              }),
            });

            if (!chunkRes.ok) {
              const errData = await chunkRes.json().catch(() => ({}));
              throw new Error(errData.error || `Chunk HTTP ${chunkRes.status}`);
            }

            offset = end;
          }
          return;
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
    setUploadError(null);

    let completedCount = 0;
    const failedFiles: File[] = [];
    const queue = [...selectedFiles];

    const worker = async () => {
      while (queue.length > 0) {
        const file = queue.shift();
        if (!file) break;
        try {
          await uploadFileToVercel(file, 3);
        } catch (e) {
          console.error(`Upload failed for ${file.name}:`, e);
          failedFiles.push(file);
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

    if (failedFiles.length > 0) {
      setUploadError(`${failedFiles.length} file(s) failed to upload. Please check connection.`);
      setSelectedFiles(failedFiles);
    } else {
      setUploadSuccess(true);
      setSelectedFiles([]);
      fetchDrivePhotos();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-12 px-4 relative z-20 font-sans">
      {/* Hidden File & Camera Input Elements */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="max-w-6xl mx-auto space-y-8 text-center">

        {/* GALLERY HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#008070] font-bold mb-1">
            <Sparkles size={14} className="text-[#B38728]" />
            <span>Royal Moments</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-[#0A4A40] tracking-[0.15em] uppercase">
            GALLERY
          </h1>
          <p className="text-sm sm:text-base text-[#2D3748]/80 font-serif italic tracking-wide">
            Share your moments with us
          </p>

          {/* DUAL ACTION BUTTONS: UPLOAD PHOTOS & TAKE PHOTO */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-xl bg-[#FFFDF9] border-2 border-[#D4AF37] text-[#0A4A40] hover:bg-[#D4AF37] hover:text-[#FFFDF9] font-serif font-extrabold text-xs uppercase tracking-[0.15em] transition-all shadow-md flex items-center gap-2.5 cursor-pointer active:scale-95"
            >
              <ImageIcon size={16} className="text-[#B38728]" />
              <span>UPLOAD PHOTOS</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="px-6 py-3 rounded-xl bg-[#FFFDF9] border-2 border-[#D4AF37] text-[#0A4A40] hover:bg-[#D4AF37] hover:text-[#FFFDF9] font-serif font-extrabold text-xs uppercase tracking-[0.15em] transition-all shadow-md flex items-center gap-2.5 cursor-pointer active:scale-95"
            >
              <Camera size={16} className="text-[#008070]" />
              <span>TAKE PHOTO</span>
            </button>
          </div>
        </motion.div>

        {/* UPLOAD STATUS & PENDING FILES BAR */}
        <AnimatePresence>
          {(selectedFiles.length > 0 || isUploading || uploadSuccess || uploadError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-2xl mx-auto bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-3xl p-6 shadow-xl text-left space-y-4"
            >
              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-300 text-green-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  <span>Success! Photos uploaded to Arjun & Kanishka&apos;s Google Drive! 🎉</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold">
                  ⚠️ {uploadError}
                </div>
              )}

              {selectedFiles.length > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs font-bold text-[#0A4A40] uppercase tracking-wider border-b border-[#D4AF37]/30 pb-2">
                    <span>Selected Files Queue ({selectedFiles.length})</span>
                    <button onClick={() => setSelectedFiles([])} className="text-red-600 hover:underline cursor-pointer">Clear</button>
                  </div>

                  {isUploading && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-[#0A4A40]">
                        <span>Uploading {currentFileIdx} of {selectedFiles.length}...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#F4EDE2] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#008070] to-[#D4AF37] transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleStartUpload}
                    disabled={isUploading}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs uppercase tracking-wider shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={16} />
                    <span>{isUploading ? 'Uploading to Drive...' : `Start Uploading ${selectedFiles.length} File(s)`}</span>
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HIGH-DENSITY PHOTO GALLERY GRID MATCHING SCREENSHOT */}
        {localPreviews.length === 0 ? (
          <div className="bg-[#FFFDF9] border-2 border-dashed border-[#D4AF37]/60 rounded-3xl p-10 text-center max-w-xl mx-auto my-8 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF6F0] border border-[#D4AF37] text-[#0A4A40] flex items-center justify-center mx-auto shadow-md">
              <ImageIcon size={32} className="text-[#008070]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0A4A40]">
              No Shared Photos Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#2D3748]/70 max-w-md mx-auto font-serif leading-relaxed">
              Be the first to share your favorite clicks from Arjun & Kanishka&apos;s wedding celebrations! Tap <strong>UPLOAD PHOTOS</strong> or <strong>TAKE PHOTO</strong> above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-4">
            {localPreviews.map((photo) => (
              <motion.div
                key={photo.id}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedLightboxPhoto(photo)}
                className={`relative rounded-2xl overflow-hidden shadow-md border-2 border-[#D4AF37]/40 bg-[#FFFDF9] cursor-pointer group ${
                  photo.isPolaroid ? 'p-2 pb-5 border-[#D4AF37] shadow-xl' : 'aspect-square'
                }`}
              >
                <div className="w-full h-full overflow-hidden rounded-xl bg-black/5 relative">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Wedding Photo'}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
                    <Maximize2 size={18} className="text-[#FFFDF9]" />
                  </div>
                </div>

                {photo.caption && (
                  <div className="mt-2 text-[10px] sm:text-xs text-[#0A4A40] font-serif font-bold truncate px-1 text-center">
                    {photo.caption}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* BOTTOM DRIVE LINK & SECURITY FOOTER */}
        <div className="pt-8 border-t border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-4 text-xs text-[#2D3748]/80">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[#008070]" />
            <span>Files are saved directly to Arjun & Kanishka&apos;s Google Drive album.</span>
          </div>

          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#0A4A40] font-serif font-bold hover:text-[#008070] underline cursor-pointer"
          >
            <span>Open Google Drive Album</span>
            <ExternalLink size={12} />
          </a>
        </div>

      </div>

      {/* LIGHTBOX EXPAND MODAL */}
      <AnimatePresence>
        {selectedLightboxPhoto && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col items-center justify-center text-center"
            >
              <button
                onClick={() => setSelectedLightboxPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#FAF6F0] text-[#0A4A40] hover:bg-[#D4AF37] hover:text-white transition-colors cursor-pointer z-10"
              >
                <X size={18} />
              </button>

              <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden bg-black/10 flex items-center justify-center my-auto">
                <img
                  src={selectedLightboxPhoto.url}
                  alt={selectedLightboxPhoto.caption || 'Expanded Photo'}
                  className="max-h-[70vh] max-w-full object-contain"
                />
              </div>

              {selectedLightboxPhoto.caption && (
                <div className="mt-4 font-serif font-extrabold text-base sm:text-lg text-[#0A4A40]">
                  {selectedLightboxPhoto.caption}
                </div>
              )}

              <div className="mt-3 flex items-center gap-3">
                <a
                  href={selectedLightboxPhoto.url}
                  download="wedding_photo.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[#0A4A40] text-[#FFFDF9] font-serif font-bold text-xs hover:bg-[#008070] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download size={14} />
                  <span>Download Photo</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
