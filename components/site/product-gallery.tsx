"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { productImageUrl } from "@/lib/storage";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({
  images,
  productName,
  sold,
}: {
  images: ProductImage[];
  productName: string;
  sold?: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selected, setSelected] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [zoomed, setZoomed] = React.useState(false);

  const onSelect = React.useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = React.useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-sm border border-border bg-card text-sm text-foreground-muted">
        Görsel yok
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-sm border border-border bg-card">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="relative aspect-square min-w-0 flex-[0_0_100%] cursor-zoom-in"
                aria-label={`${productName} görsel ${i + 1}`}
              >
                <Image
                  src={productImageUrl(img.storage_path)}
                  alt={`${productName} — ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className={cn("object-cover", sold && "grayscale brightness-50")}
                />
              </button>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              aria-label="Önceki görsel"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              aria-label="Sonraki görsel"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          aria-label="Tam ekran"
        >
          <Expand className="size-4" />
        </button>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => scrollTo(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-sm border transition-colors",
                selected === i ? "border-accent" : "border-border hover:border-foreground-secondary"
              )}
            >
              <Image
                src={productImageUrl(img.storage_path)}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={(open) => { setLightboxOpen(open); if (!open) setZoomed(false); }}>
        <DialogContent
          hideClose
          className="max-w-5xl border-none bg-transparent p-0 shadow-none"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute -top-10 right-0 text-white/80 hover:text-white"
          >
            <X className="size-6" />
          </button>
          <div
            className="relative h-[80vh] w-full cursor-zoom-in overflow-hidden rounded-sm bg-black"
            onClick={() => setZoomed((z) => !z)}
          >
            <Image
              src={productImageUrl(images[selected]?.storage_path ?? images[0].storage_path)}
              alt={productName}
              fill
              sizes="90vw"
              className={cn("object-contain transition-transform duration-300", zoomed && "scale-150")}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
