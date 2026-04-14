'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Handshake } from 'lucide-react';

interface LogoUploaderProps {
  value: string;
  partnerName: string;
  onChange: (value: string) => void;
}

const MAX_DIM = 256;      // longest side of the downsized image
const MAX_BYTES = 500_000; // ~500KB data-URL safety cap

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        const scale = Math.min(MAX_DIM / img.width, MAX_DIM / img.height, 1);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unavailable'));
        ctx.drawImage(img, 0, 0, w, h);
        // Try PNG first (preserves transparency for logos); fall back to JPEG if too big.
        let dataUrl = canvas.toDataURL('image/png');
        if (dataUrl.length > MAX_BYTES) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function LogoUploader({ value, partnerName, onChange }: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [draftUrl, setDraftUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await resizeImage(file);
      onChange(dataUrl);
    } catch (err) {
      setError((err as Error).message || 'Could not process image.');
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlSave = () => {
    const trimmed = draftUrl.trim();
    if (trimmed) {
      onChange(trimmed);
      setDraftUrl('');
      setShowUrl(false);
      setError(null);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Logo preview */}
      <div className="w-28 h-28 bg-white rounded-2xl border-2 border-purple-200 flex items-center justify-center shrink-0 overflow-hidden relative">
        {value ? (
          // Data URLs and external URLs both work with unoptimized
          <Image
            src={value}
            alt={partnerName || 'Partner logo'}
            width={112}
            height={112}
            className="object-contain p-2"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <Handshake size={32} />
            <span className="text-[9px] mt-1 uppercase tracking-wider">No logo</span>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-gray-300 border-t-purple-600" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40"
        >
          <Upload size={11} /> {value ? 'Replace' : 'Upload'}
        </button>
        <button
          onClick={() => { setShowUrl(!showUrl); setDraftUrl(value && value.startsWith('http') ? value : ''); }}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
        >
          <LinkIcon size={11} /> URL
        </button>
        {value && (
          <button
            onClick={handleRemove}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium border border-red-200 rounded-lg bg-white hover:bg-red-50 text-red-600"
          >
            <X size={11} /> Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* URL input (toggled) */}
      {showUrl && (
        <div className="flex items-center gap-1 w-full max-w-xs">
          <div className="relative flex-1">
            <ImageIcon size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleUrlSave(); }}
              placeholder="https://…/logo.png"
              className="w-full pl-6 pr-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400"
              autoFocus
            />
          </div>
          <button
            onClick={handleUrlSave}
            disabled={!draftUrl.trim()}
            className="px-2 py-1 text-[11px] font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      )}

      {error && <p className="text-[10px] text-red-600 max-w-[160px] text-center">{error}</p>}
      {!error && !showUrl && (
        <p className="text-[10px] text-gray-400 text-center">PNG, JPG, SVG &lt;5MB. Auto-resized to 256px.</p>
      )}
    </div>
  );
}
