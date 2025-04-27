
const loadingTexts = [
  "Mengambil data...",
  "Menyiapkan halaman...",
  "Sebentar ya...",
  "Memuat konten...",
];

export default function LoadingScreen() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="text-center">
        <div className="relative mx-auto mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-l-2 border-gray-400"></div>
          <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-300 font-light text-xl tracking-wider">
                  L
                </span>
          </div>
        </div>
        <p className="mt-3 text-sm font-light text-gray-400 tracking-wide opacity-80">
          {loadingTexts[Math.floor(Math.random() * loadingTexts.length)]}
        </p>
      </div>
    </div>
  );
}