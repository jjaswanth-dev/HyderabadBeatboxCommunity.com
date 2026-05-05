"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center">
      <div className="font-4xl bg-gradient-to-r from-black via-white to-black bg-[200%] bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-loader [-webkit-text-fill-color:transparent] [-webkit-background-clip:text]">
        3 2 1 Beatbox...
      </div>
      <div className="ml-3">
        <div className="inline-block w-3 h-3 rounded-full border border-gray-300 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}
