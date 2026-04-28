"use client";

import { useState, useRef } from "react";
import { Camera, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";

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
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="no-print mb-16">
      <div className="mb-6 flex items-center justify-between border-b border-outline-variant/30 pb-2">
        <h3 className="font-label text-[11px] font-bold uppercase tracking-widest text-outline">
          Professional Activity Gallery
        </h3>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => scroll("left")}
             className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/30 bg-surface text-secondary transition-colors hover:bg-primary hover:text-white"
           >
             <ChevronLeft size={16} />
           </button>
           <button 
             onClick={() => scroll("right")}
             className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/30 bg-surface text-secondary transition-colors hover:bg-primary hover:text-white"
           >
             <ChevronRight size={16} />
           </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div 
            key={item.id}
            className="group relative h-[280px] w-[320px] flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-surface-container-low shadow-sm transition-all hover:shadow-xl md:w-[400px]"
          >
            <Image 
              src={item.image_url} 
              alt={item.caption || "Activity photo"} 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 320px, 400px"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-90" />
            
            {/* Caption & Actions */}
            <div className="absolute inset-x-0 bottom-0 p-5 transform translate-y-2 transition-transform group-hover:translate-y-0">
              {item.caption && (
                <p className="font-body text-[14px] font-medium text-white line-clamp-2 mb-3">
                  {item.caption}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-2.5 py-1 font-label text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/20">
                  {item.category || "Professional Activity"}
                </span>
                <button 
                  onClick={() => setSelectedImage(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-primary"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm transition-all animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          
          <div className="relative h-[85vh] w-[90vw] overflow-hidden rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <Image 
              src={selectedImage.image_url} 
              alt={selectedImage.caption} 
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
            {selectedImage.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-6 backdrop-blur-md">
                <p className="font-body text-[16px] font-medium text-white text-center">
                  {selectedImage.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
