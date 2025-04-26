import { useEffect, useState } from "react";

const loadingTexts = [
  "Mengambil data...",
  "Menyiapkan halaman...",
  "Sebentar ya...",
  "Memuat konten...",
];

export default function LoadingScreen() {
  const [textIdx, setTextIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIdx((idx) => (idx + 1) % loadingTexts.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="text-center">
        <div className="relative mx-auto mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-700"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-700 font-bold text-xl">Lingora</span>
          </div>
        </div>
        <p className="mt-2 text-lg font-semibold text-blue-800 animate-pulse">
          {loadingTexts[textIdx]}
        </p>
      </div>
    </div>
  );
}