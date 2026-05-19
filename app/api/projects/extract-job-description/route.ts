import { NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createWorker } from "tesseract.js";
import path from "path";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function getFriendlyTypeName(mimeType: string) {
  switch (mimeType) {
    case "application/pdf":
      return "PDF";
    case "image/png":
      return "PNG";
    case "image/jpeg":
      return "JPG/JPEG";
    case "image/webp":
      return "WEBP";
    default:
      return mimeType || "unknown file type";
  }
}

function cleanExtractedText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => {
      // Normalize whitespace
      line = line.replace(/[^\S\n]+/g, " ").trim();
      
      // Remove lines that are mostly special characters or corrupted
      const specialCharCount = (line.match(/[^\w\s\-'.,;:()&]/g) || []).length;
      const ratio = specialCharCount / Math.max(line.length, 1);
      
      // If more than 40% special characters, it's likely noise
      if (ratio > 0.4) return "";
      
      // Remove very short lines (likely noise or artifacts)
      if (line.length < 3) return "";
      
      // Remove lines that are just numbers, symbols, or URLs-like patterns
      if (/^[\d\s\-\(\)\[\]]*$/.test(line)) return "";
      if (/^[^a-zA-Z]*$/.test(line)) return "";
      
      // Remove lines that look like QR codes, contact info patterns, or decorative elements
      if (/(?:QR|Code|www\.|@|\[E\]|©|™|®|•|◆|■|□)/.test(line)) return "";
      
      return line;
    })
    .filter((line) => line.length > 0)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractTextFromPdf(file: File) {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    disableFontFace: true,
  });

  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (text) {
      pages.push(text);
    }
  }

  return cleanExtractedText(pages.join("\n\n"));
}

async function extractTextFromImage(file: File) {
  // Resolve the worker path using proper Node.js path resolution
  // This works with Turbopack and webpack bundlers
  const nodeModulesPath = path.resolve(process.cwd(), "node_modules");
  const workerPath = path.resolve(
    nodeModulesPath,
    "tesseract.js/src/worker-script/node/index.js"
  );
  
  const worker = await createWorker("eng", 1, { workerPath });
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await worker.recognize(buffer);
    return cleanExtractedText(result.data.text);
  } finally {
    await worker.terminate();
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("jobDescriptionFile");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Please upload a job description file." },
        { status: 400 }
      );
    }

    if (!SUPPORTED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          message: `Unsupported file type "${getFriendlyTypeName(file.type)}". Please upload PNG, JPG/JPEG, WEBP, or PDF.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "File is too large. Please upload a file smaller than 5 MB." },
        { status: 400 }
      );
    }

    const extractedText =
      file.type === "application/pdf"
        ? await extractTextFromPdf(file)
        : await extractTextFromImage(file);

    if (!extractedText) {
      return NextResponse.json(
        {
          message:
            file.type === "application/pdf"
              ? "No readable text was found in the PDF. If this is a scanned document, please upload an image version or paste the job description manually."
              : "No readable text was found in the uploaded image. Please try a clearer screenshot or paste the job description manually.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error("Failed to extract job description text:", error);
    return NextResponse.json(
      { message: "Failed to extract the job description text. Please try again or paste it manually." },
      { status: 500 }
    );
  }
}
