import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export async function POST(req: NextRequest) {
  const { filename, contentType } = await req.json();
  if (!filename) return NextResponse.json({ error: "filename krävs" }, { status: 400 });
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!bucket || !accessKeyId || !secretAccessKey) {
    return NextResponse.json({ url: null, publicUrl: "https://images.unsplash.com/photo-1520975922131-c3a84b0d96f8?q=80&w=1600&auto=format&fit=crop" });
  }
  const s3 = new S3Client({ region, endpoint, credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true });
  const key = `uploads/${Date.now()}-${filename}`;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType || "application/octet-stream" });
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
  const publicUrl = `${endpoint?.replace(/\/$/,'')}/${bucket}/${key}`;
  return NextResponse.json({ url: signedUrl, publicUrl });
}
