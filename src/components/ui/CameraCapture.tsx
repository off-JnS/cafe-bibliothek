import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
}

const MAX_SIZE = 400;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = url;
  });
}

export default function CameraCapture({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImage(file);
    setPreview(dataUrl);
    onChange(dataUrl);
  };

  const handleClear = () => {
    setPreview("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />
      {preview ? (
        <div className="relative h-32 w-24 overflow-hidden rounded-lg">
          <img src={preview} alt="Cover" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1 right-1 rounded-full bg-charcoal/60 p-1 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-24 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-sage-light bg-cream text-sage-dark transition-colors active:bg-sage-light/50"
        >
          <Camera className="h-6 w-6" />
          <span className="text-[10px] font-medium">Foto</span>
        </button>
      )}
    </div>
  );
}
