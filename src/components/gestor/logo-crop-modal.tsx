'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { X, Check } from 'lucide-react'

interface LogoCropModalProps {
  imageUrl: string
  onConfirm: (blob: Blob) => void
  onClose: () => void
}

export function LogoCropModal({ imageUrl, onConfirm, onClose }: LogoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedArea) return
    const blob = await cropAndCompress(imageUrl, croppedArea)
    onConfirm(blob)
  }

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-black/60 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-[420px] rounded-[22px] bg-[var(--surface)] p-[18px] shadow-[var(--shadow-lg)] animate-in slide-in-from-bottom-5 duration-250">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-[19px] font-bold tracking-tight">Ajustar logo</h2>
          <button
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative h-[300px] w-full overflow-hidden rounded-xl bg-black">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-[var(--muted-foreground)]">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[var(--brand)]"
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] px-4 text-sm font-semibold text-[var(--ink-2)] transition-all hover:bg-[var(--bg-2)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--brand)] px-4 text-sm font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-sm)] transition-all hover:brightness-95 active:translate-y-px"
          >
            <Check size={16} />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

async function cropAndCompress(imageSrc: string, crop: Area): Promise<Blob> {
  const img = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const size = 512
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    img,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, size, size,
  )

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/webp',
      0.82,
    )
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
