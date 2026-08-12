"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productImageUrl } from "@/lib/storage";
import type { ProductImage } from "@/lib/types";

interface UploadItem {
  key: string;
  file: File;
  progress: number;
  status: "uploading" | "error";
  error?: string;
}

function uploadFile(
  file: File,
  productId: string,
  isCover: boolean,
  onProgress: (pct: number) => void
): Promise<ProductImage> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data.image);
        else reject(new Error(data.error ?? "Yükleme başarısız oldu."));
      } catch {
        reject(new Error("Yükleme başarısız oldu."));
      }
    };
    xhr.onerror = () => reject(new Error("Bağlantı hatası."));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);
    formData.append("isCover", String(isCover));
    xhr.send(formData);
  });
}

export function ImageUploader({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const [images, setImages] = React.useState<ProductImage[]>(
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [uploads, setUploads] = React.useState<UploadItem[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    files.forEach((file, i) => startUpload(file, images.length === 0 && i === 0));
  }

  function startUpload(file: File, isCover: boolean) {
    const key = `${file.name}-${Date.now()}-${Math.random()}`;
    setUploads((prev) => [...prev, { key, file, progress: 0, status: "uploading" }]);

    uploadFile(file, productId, isCover, (pct) => {
      setUploads((prev) => prev.map((u) => (u.key === key ? { ...u, progress: pct } : u)));
    })
      .then((image) => {
        setImages((prev) => [...prev, image]);
        setUploads((prev) => prev.filter((u) => u.key !== key));
      })
      .catch((err: Error) => {
        setUploads((prev) =>
          prev.map((u) => (u.key === key ? { ...u, status: "error", error: err.message } : u))
        );
      });
  }

  function retry(item: UploadItem) {
    setUploads((prev) => prev.filter((u) => u.key !== item.key));
    startUpload(item.file, images.length === 0);
  }

  function dismiss(key: string) {
    setUploads((prev) => prev.filter((u) => u.key !== key));
  }

  async function setCover(imageId: string) {
    setImages((prev) => prev.map((img) => ({ ...img, is_cover: img.id === imageId })));
    const res = await fetch(`/api/admin/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCover: true }),
    });
    if (!res.ok) toast.error("Kapak görseli ayarlanamadı.");
  }

  async function deleteImage(imageId: string) {
    const prevImages = images;
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    const res = await fetch(`/api/admin/images/${imageId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Görsel silinemedi.");
      setImages(prevImages);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    fetch("/api/admin/images/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((img) => img.id) }),
    }).catch(() => toast.error("Sıralama kaydedilemedi."));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden rounded-sm border border-border bg-background-secondary"
          >
            <Image
              src={productImageUrl(img.storage_path)}
              alt=""
              fill
              sizes="200px"
              className="object-cover"
            />
            {img.is_cover && (
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
                <Star className="size-2.5 fill-current" />
                Kapak
              </span>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-1">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded-sm bg-white/10 p-1.5 text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="rounded-sm bg-white/10 p-1.5 text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
              {!img.is_cover && (
                <button
                  onClick={() => setCover(img.id)}
                  className="rounded-sm bg-white/10 px-2 py-1 text-[11px] text-white hover:bg-white/20"
                >
                  Kapak Yap
                </button>
              )}
              <button
                onClick={() => deleteImage(img.id)}
                className="rounded-sm bg-accent/80 px-2 py-1 text-[11px] text-white hover:bg-accent"
              >
                <Trash2 className="size-3 inline" /> Sil
              </button>
            </div>
          </div>
        ))}

        {uploads.map((u) => (
          <div
            key={u.key}
            className="relative flex aspect-square flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-border bg-background-secondary p-2 text-center"
          >
            {u.status === "uploading" ? (
              <>
                <Loader2 className="size-5 animate-spin text-foreground-secondary" />
                <span className="text-[11px] text-foreground-muted">%{u.progress}</span>
              </>
            ) : (
              <>
                <span className="text-[11px] text-accent">{u.error}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => retry(u)}>
                    Tekrar Dene
                  </Button>
                  <button
                    onClick={() => dismiss(u.key)}
                    className="p-1 text-foreground-muted hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-border text-foreground-secondary transition-colors hover:border-foreground-secondary hover:text-foreground"
        >
          <Camera className="size-5" />
          <span className="text-[11px]">Fotoğraf Çek / Seç</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <p className="mt-3 flex items-center gap-1.5 text-xs text-foreground-muted">
        <ImagePlus className="size-3.5" />
        Kameradan çekebilir veya galeriden birden fazla fotoğraf seçebilirsiniz.
      </p>
    </div>
  );
}
