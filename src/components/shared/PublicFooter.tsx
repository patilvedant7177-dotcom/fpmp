import Image from "next/image";

export default function PublicFooter() {
  return (
    <footer className="mt-auto w-full bg-slate-100/50 backdrop-blur-sm no-print">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between border-t border-slate-200/20 px-6 py-6 md:flex-row md:px-12">
        <div className="flex items-center gap-2">
          <Image 
            src="/institute-logo.png" 
            alt="Fr. CRCE Logo" 
            width={100} 
            height={28} 
            className="h-7 w-auto object-contain opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
          />
        </div>

        <div className="flex gap-8 md:mt-0">
          {/* Links removed as per user request */}
        </div>
      </div>
    </footer>
  );
}
