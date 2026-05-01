"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X, Camera } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GalleryItem {
  id: string;
  image_url: string;
  caption: string;
  category?: string;
}

interface ActivityGalleryProps {
  items: GalleryItem[];
}

export default function ActivityGallery({ items }: ActivityGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const nextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prev) => (prev! + 1) % items.length);
    }
  };

  const prevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prev) => (prev! - 1 + items.length) % items.length);
    }
  };

  // Auto-play
  useEffect(() => {
    if (isHovered || selectedImageIndex !== null) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered, selectedImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex !== null) {
        if (e.key === "ArrowRight") setSelectedImageIndex((prev) => (prev! + 1) % items.length);
        if (e.key === "ArrowLeft") setSelectedImageIndex((prev) => (prev! - 1 + items.length) % items.length);
        if (e.key === "Escape") setSelectedImageIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, items.length]);

  if (!items || items.length === 0) return null;

  return (
    <section className="no-print mb-16 px-4 md:px-0">
      <div className="mb-8 flex items-center justify-between border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Camera size={20} />
          </div>
          <div>
            <h3 className="font-headline text-[15px] font-extrabold uppercase tracking-widest text-primary">
              Professional Portfolio
            </h3>
            <p className="text-[14px] font-medium text-on-surface">Activity Gallery</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="rounded-full group h-10 w-10"
          >
            <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-full group h-10 w-10"
          >
            <ChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-start w-full">
        <div 
          className="group relative h-[280px] w-full overflow-hidden rounded-2xl bg-surface-container-low shadow-md transition-all hover:shadow-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Slider Track */}
          <div 
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {items.map((item, index) => (
              <div 
                key={item.id}
                className="relative h-full w-full flex-shrink-0"
              >
                <Image 
                  src={item.image_url} 
                  alt={item.caption || "Activity photo"} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 320px, 450px"
                  priority={index === 0}
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Caption Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-5 transform transition-transform">
                  <span className="mb-2 inline-block rounded-full bg-white/10 px-2.5 py-1 font-label text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/20">
                    {item.category || "Activity"}
                  </span>
                  <p className="font-body text-[14px] font-medium text-white line-clamp-2">
                    {item.caption}
                  </p>
                  <button 
                    onClick={() => setSelectedImageIndex(index)}
                    className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-primary"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-5 flex gap-1.5">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  currentIndex === index ? "w-6 bg-white" : "w-1 bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal with Slider */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-all animate-in fade-in duration-300"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button 
            className="absolute top-6 right-6 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-110"
            onClick={() => setSelectedImageIndex(null)}
          >
            <X size={24} />
          </button>

          {/* Lightbox Navigation */}
          <button 
            onClick={prevLightbox}
            className="absolute left-4 z-[110] flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md transition-all hover:bg-white/20 md:left-8"
          >
            <ChevronLeft size={32} />
          </button>
          
          <button 
            onClick={nextLightbox}
            className="absolute right-4 z-[110] flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md transition-all hover:bg-white/20 md:right-8"
          >
            <ChevronRight size={32} />
          </button>
          
          <div className="relative flex h-full w-full items-center justify-center p-4 md:p-12" onClick={e => e.stopPropagation()}>
            <div className="relative h-full w-full max-w-6xl">
              <Image 
                src={items[selectedImageIndex].image_url} 
                alt={items[selectedImageIndex].caption} 
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
              
              {items[selectedImageIndex].caption && (
                <div className="absolute inset-x-0 bottom-0 flex justify-center pb-8">
                  <div className="max-w-2xl rounded-2xl bg-black/40 px-8 py-4 text-center backdrop-blur-xl border border-white/10">
                    <p className="font-body text-[18px] font-medium text-white">
                      {items[selectedImageIndex].caption}
                    </p>
                    <span className="mt-2 block text-[12px] font-bold uppercase tracking-widest text-primary/80">
                      {selectedImageIndex + 1} / {items.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
