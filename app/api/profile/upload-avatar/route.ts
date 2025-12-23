import cloudinary from "@/lib/upload"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const data = await req.formData()
  const file = data.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const upload = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "avatars" }, (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
      .end(buffer)
  })

  return NextResponse.json({ url: upload.secure_url })
}
