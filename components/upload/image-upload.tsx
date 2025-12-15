"use client"

import type React from "react"

import { useState } from "react"
import { useUploadThing } from "@/lib/uploadthing"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
}

export function ImageUpload({ value = [], onChange, maxFiles = 6 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { startUpload } = useUploadThing("imageUploader")
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploaded = await startUpload(files)
      if (uploaded) {
        const urls = uploaded.map((file) => file.url)
        onChange([...value, ...urls].slice(0, maxFiles))
        toast({
          title: "Фото загружено!",
          description: `Успешно загружено ${uploaded.length} фото`,
        })
      }
    } catch (error: any) {
      console.error("Ошибка загрузки:", error)
      toast({
        title: "Ошибка загрузки",
        description: error?.message || "Не удалось загрузить фото. Проверьте настройки UploadThing.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (url: string) => {
    onChange(value.filter((v) => v !== url))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border">
            <Image src={url || "/placeholder.svg"} alt="Uploaded" fill className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {value.length < maxFiles && (
          <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">{uploading ? "Загрузка..." : "Загрузить"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {value.length} / {maxFiles} фотографий загружено
      </p>
    </div>
  )
}
