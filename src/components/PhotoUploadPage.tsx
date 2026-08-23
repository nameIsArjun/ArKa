import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ExternalLink, Sparkles, Image as ImageIcon, X, CheckCircle2, Camera, ShieldCheck, Maximize2, Download, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { WEDDING_DETAILS, UPLOAD_CONCURRENCY_LIMIT } from '../data/weddingData';

// Swiper Components & Modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';

interface GalleryPhoto {
  id: string;
  url: string;
  isPolaroid?: boolean;
  createdTime?: string;
}

interface PendingFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

export const PhotoUploadPage: React.FC = () => {
  const [pendingFiles, setPendingFiles] = useState<PendingFileItem[]>([]);
  const [drivePhotos, setDrivePhotos] = useState<GalleryPhoto[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFileIdx, setCurrentFileIdx] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Lightbox Swiper state
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState<number | null>(null);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState<number>(0);
  const lightboxSwiperRef = useRef<SwiperType | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileBase64CacheRef = useRef<Map<File, Promise<string>>>(new Map());

  const folderId = '1SmRzW3JpwfkYwQ_hEF9Cr5k7_KVKWUZR';
  const details = WEDDING_DETAILS as Record<string, any>;
  const driveUrl = details.sharedDriveUrl || `https://drive.google.com/drive/folders/${folderId}?usp=sharing`;

  const fetchDrivePhotos = async () => {
    setIsLoadingDrive(true);
    try {
      const res = await fetch('/api/upload?action=list');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.files)) {
          const photos: GalleryPhoto[] = data.files.map((file: any, idx: number) => ({
            id: file.id,
            url: file.thumbnailUrl || file.fullUrl,
            isPolaroid: idx % 5 === 0,
            createdTime: file.createdTime,
          }));
          setDrivePhotos(photos);
        }
      }
    } catch (e) {
      console.error('Error fetching Google Drive photos:', e);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  useEffect(() => {
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
      const newPendingItems: PendingFileItem[] = filesArray.map((file, idx) => ({
        id: `pending-${Date.now()}-${idx}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setPendingFiles((prev) => [...prev, ...newPendingItems]);
      setUploadSuccess(false);
      setUploadError(null);

      // Pre-warm base64 encoding in background
      filesArray.forEach((file) => {
        getFileBase64(file);
      });

      e.target.value = '';
    }
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
        fileBase64CacheRef.current.delete(itemToRemove.file);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAllPending = () => {
    pendingFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setPendingFiles([]);
    setUploadError(null);
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
    if (pendingFiles.length === 0) return;

    const totalFiles = pendingFiles.length;

    setIsUploading(true);
    setUploadProgress(5);
    setCurrentFileIdx(0);
    setUploadSuccess(false);
    setUploadError(null);

    let completedCount = 0;
    const failedItems: PendingFileItem[] = [];
    const queue = [...pendingFiles];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;
        try {
          await uploadFileToVercel(item.file, 3);
        } catch (e) {
          console.error(`Upload failed for ${item.file.name}:`, e);
          failedItems.push(item);
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

    if (failedItems.length > 0) {
      setUploadError(`${failedItems.length} file(s) failed to upload. Please try again.`);
      setPendingFiles(failedItems);
    } else {
      setUploadSuccess(true);
      setPendingFiles([]);
      fetchDrivePhotos();
    }
  };

  const openLightbox = (index: number) => {
    setLightboxInitialIndex(index);
    setCurrentLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxInitialIndex(null);
  };

  const currentActivePhoto = drivePhotos[currentLightboxIndex] || drivePhotos[0];

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-12 px-4 relative z-20 font-sans">
      {/* Hidden File & Camera Inputs */}
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

      <div className="max-w-6xl mx-auto space-y-10 text-center">

        {/* 1. GALLERY HERO HEADER SECTION */}
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

        {/* 2. SUCCESS / ERROR FLOATING BANNER */}
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto p-4 rounded-2xl bg-green-50 border border-green-300 text-green-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <CheckCircle2 size={18} className="text-green-600 shrink-0" />
              <span>🎉 All photos uploaded successfully! They are now live in the gallery below.</span>
            </motion.div>
          )}

          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto p-4 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <AlertCircle size={18} className="text-red-600 shrink-0" />
              <span>⚠️ {uploadError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. SEGREGATED SECTION: PENDING UPLOADS QUEUE */}
        <AnimatePresence>
          {pendingFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto bg-[#FFFDF9] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl text-left space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/30 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B38728] animate-ping" />
                    <h3 className="font-serif text-lg sm:text-xl font-extrabold text-[#0A4A40]">
                      Ready to Upload ({pendingFiles.length} Selected)
                    </h3>
                  </div>
                  <p className="text-xs text-[#2D3748]/70 mt-0.5">
                    Review your chosen photos before uploading to Arjun & Kanishka&apos;s Google Drive album.
                  </p>
                </div>

                <button
                  onClick={clearAllPending}
                  disabled={isUploading}
                  className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>

              {/* Pending Photos Thumbnail Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-h-[360px] overflow-y-auto pr-1">
                {pendingFiles.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-xl overflow-hidden border border-[#D4AF37]/50 shadow-sm bg-[#FAF6F0] group aspect-square flex flex-col justify-between"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-cover object-center"
                    />

                    <div className="absolute top-1.5 right-1.5 z-10">
                      <button
                        onClick={() => removePendingFile(item.id)}
                        disabled={isUploading}
                        className="w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] text-white font-mono truncate">
                      {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-2 bg-[#FAF6F0] p-4 rounded-2xl border border-[#D4AF37]/30">
                  <div className="flex justify-between text-xs font-bold text-[#0A4A40]">
                    <span>Uploading File {currentFileIdx} of {pendingFiles.length}...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#F4EDE2] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#008070] via-[#D4AF37] to-[#B38728] transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Big Gold Upload Action CTA Button */}
              <button
                onClick={handleStartUpload}
                disabled={isUploading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-sm uppercase tracking-wider shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <Upload size={18} className="text-[#0A4A40]" />
                <span>
                  {isUploading
                    ? `Uploading ${currentFileIdx} of ${pendingFiles.length} to Drive...`
                    : `Upload ${pendingFiles.length} Photo${pendingFiles.length > 1 ? 's' : ''} to Google Drive`}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. SEGREGATED SECTION: LIVE UPLOADED GOOGLE DRIVE GALLERY (CLEAN NO FILENAMES) */}
        <div className="space-y-6 pt-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/30 pb-3">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0A4A40]">
                Shared Wedding Moments
              </h2>
              <p className="text-xs sm:text-sm text-[#2D3748]/70 mt-0.5">
                {isLoadingDrive
                  ? 'Loading live photos from Google Drive...'
                  : `${drivePhotos.length} photo${drivePhotos.length === 1 ? '' : 's'} shared by family & guests`}
              </p>
            </div>

            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFFDF9] border border-[#D4AF37] text-xs font-serif font-bold text-[#0A4A40] hover:bg-[#D4AF37] hover:text-white transition-all shadow-xs cursor-pointer"
            >
              <span>Open Google Drive</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Clean Drive Photo Grid (NO FILENAMES) */}
          {isLoadingDrive ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#2D3748]/70 font-serif">Loading gallery photos from Google Drive...</p>
            </div>
          ) : drivePhotos.length === 0 ? (
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {drivePhotos.map((photo, idx) => (
                <motion.div
                  key={photo.id}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => openLightbox(idx)}
                  className={`relative rounded-2xl overflow-hidden shadow-md border-2 border-[#D4AF37]/40 bg-[#FFFDF9] cursor-pointer group ${
                    photo.isPolaroid ? 'p-2 pb-4 border-[#D4AF37] shadow-xl' : 'aspect-square'
                  }`}
                >
                  <div className="w-full h-full overflow-hidden rounded-xl bg-black/5 relative aspect-square">
                    <img
                      src={photo.url}
                      alt="Wedding Photo"
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
                      <Maximize2 size={20} className="text-[#FFFDF9]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 5. BOTTOM SECURITY & PRIVACY FOOTER */}
        <div className="pt-8 border-t border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-4 text-xs text-[#2D3748]/80 text-left">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[#008070]" />
            <span>Files are stored securely in Arjun & Kanishka&apos;s official Google Drive album.</span>
          </div>

          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#0A4A40] font-serif font-bold hover:text-[#008070] underline cursor-pointer"
          >
            <span>View Full Folder in Google Drive</span>
            <ExternalLink size={12} />
          </a>
        </div>

      </div>

      {/* 6. IMMERSIVE BLURRED BACKDROP LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxInitialIndex !== null && (
          <div className="fixed inset-0 z-[99999] flex flex-col justify-between p-3 sm:p-6 bg-black/95 overflow-hidden select-none">

            {/* Dynamic Cinematic Blurred Background of Active Photo */}
            {currentActivePhoto && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <img
                  src={currentActivePhoto.url}
                  alt="Backdrop Blur"
                  className="w-full h-full object-cover blur-3xl scale-125 brightness-[0.28] transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
              </div>
            )}

            {/* Top Floating Bar: Photo Counter & Close Button */}
            <div className="relative z-20 flex items-center justify-between w-full max-w-6xl mx-auto px-2 pt-1 pb-2">
              <div className="px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-[#D4AF37]/50 text-[#F3E5AB] font-serif font-bold text-xs sm:text-sm tracking-wider shadow-lg">
                Photo {currentLightboxIndex + 1} of {drivePhotos.length}
              </div>

              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-[#D4AF37]/50 text-white hover:bg-[#D4AF37] hover:text-black transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Center Swiper Touch Area */}
            <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto flex items-center justify-center overflow-hidden my-auto">
              <Swiper
                initialSlide={lightboxInitialIndex}
                onSwiper={(swiper) => {
                  lightboxSwiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                  setCurrentLightboxIndex(swiper.activeIndex);
                }}
                modules={[Navigation, Keyboard]}
                keyboard={{ enabled: true }}
                grabCursor={true}
                className="w-full h-full flex items-center justify-center"
              >
                {drivePhotos.map((photo, idx) => (
                  <SwiperSlide key={photo.id} className="w-full h-full flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center p-1 sm:p-4">
                      <img
                        src={photo.url}
                        alt={`Photo ${idx + 1}`}
                        className="max-h-[75vh] sm:max-h-[78vh] max-w-[94vw] sm:max-w-full object-contain rounded-2xl shadow-2xl border border-[#D4AF37]/30 ring-1 ring-white/10"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Left Floating Previous Arrow */}
              <button
                onClick={() => lightboxSwiperRef.current?.slidePrev()}
                disabled={currentLightboxIndex === 0}
                aria-label="Previous Photo"
                className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-[#D4AF37]/60 text-white shadow-2xl flex items-center justify-center transition-all z-30 cursor-pointer ${
                  currentLightboxIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#D4AF37] hover:text-black active:scale-95'
                }`}
              >
                <ChevronLeft size={26} />
              </button>

              {/* Right Floating Next Arrow */}
              <button
                onClick={() => lightboxSwiperRef.current?.slideNext()}
                disabled={currentLightboxIndex === drivePhotos.length - 1}
                aria-label="Next Photo"
                className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-[#D4AF37]/60 text-white shadow-2xl flex items-center justify-center transition-all z-30 cursor-pointer ${
                  currentLightboxIndex === drivePhotos.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#D4AF37] hover:text-black active:scale-95'
                }`}
              >
                <ChevronRight size={26} />
              </button>
            </div>

            {/* Bottom Floating Bar: High-Res Download Action Button */}
            <div className="relative z-20 flex items-center justify-center w-full max-w-6xl mx-auto pt-2 pb-1">
              {currentActivePhoto && (
                <a
                  href={currentActivePhoto.url}
                  download="wedding_photo.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059] text-[#0A4A40] font-serif font-extrabold text-xs sm:text-sm tracking-wider hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer shadow-xl border border-[#B38728]/40 active:scale-95"
                >
                  <Download size={16} className="text-[#0A4A40]" />
                  <span>Download Photo ({currentLightboxIndex + 1}/{drivePhotos.length})</span>
                </a>
              )}
            </div>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
