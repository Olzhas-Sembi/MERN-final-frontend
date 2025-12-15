import { createUploadthing, type FileRouter } from "uploadthing/next"

// UploadThing автоматически использует переменные окружения:
// UPLOADTHING_SECRET или UPLOADTHING_TOKEN (секретный ключ)
// NEXT_PUBLIC_UPLOADTHING_APP_ID (публичный ID приложения)
const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 6 } })
    .middleware(async (req) => {
      // Проверяем наличие переменных окружения
      const secret = process.env.UPLOADTHING_SECRET || process.env.UPLOADTHING_TOKEN || process.env.SECRET_KEY
      
      if (!secret) {
        console.error("UploadThing secret is not configured. Available env vars:", {
          UPLOADTHING_SECRET: !!process.env.UPLOADTHING_SECRET,
          UPLOADTHING_TOKEN: !!process.env.UPLOADTHING_TOKEN,
          SECRET_KEY: !!process.env.SECRET_KEY,
        })
        throw new Error("UploadThing secret is not configured. Please set UPLOADTHING_SECRET, UPLOADTHING_TOKEN, or SECRET_KEY environment variable.")
      }
      
      return {}
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.url)
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
