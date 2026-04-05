"use client";

import { useState, useEffect } from "react";
import FacultyLayout from "@/components/faculty/FacultyLayout";
import { UploadCloud, FileText, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CVUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "processing" | "success">("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startProcessing(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      startProcessing(e.target.files[0]);
    }
  };

  const startProcessing = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadState("uploading");
    setProgress(0);
    setStatusText("Uploading document securely...");

    // Mock Extraction Upload Pipeline Simulation
    setTimeout(() => {
      setUploadState("processing");
      setStatusText("AI analyzing document structure...");
      setProgress(30);
      
      setTimeout(() => {
        setStatusText("Extracting publications and awards...");
        setProgress(65);
        
        setTimeout(() => {
          setStatusText("Mapping research keywords...");
          setProgress(90);

          setTimeout(() => {
            setUploadState("success");
            setProgress(100);
          }, 800);

        }, 1200);
      }, 1500);
    }, 1000);
  };

  return (
    <FacultyLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* PAGE HEADER */}
        <div className="px-6 py-6 border-b border-outline-variant/30 shrink-0 bg-surface">
          <h1 className="font-headline text-[22px] font-bold tracking-tight text-primary">
            CV Auto-Fill Engine
          </h1>
          <p className="mt-1 font-body text-[14px] text-secondary">
            Upload your latest Resume/CV and let our AI automatically map your publications, education, and keywords directly to your profile.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-10 bg-surface-container-lowest flex items-start justify-center">
          
          <div className="w-full max-w-[600px] flex flex-col gap-6">

            {uploadState === "idle" && (
              <div 
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive ? "border-primary bg-primary-container/20 scale-[1.02]" : "border-outline-variant bg-surface hover:border-primary/50 hover:bg-surface-container/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="flex flex-col items-center gap-4 pointer-events-none">
                  <div className="h-16 w-16 bg-primary-container/30 text-primary rounded-full flex items-center justify-center mb-2">
                    <UploadCloud size={32} />
                  </div>
                  <h3 className="font-headline text-[18px] font-bold text-primary">
                    Drag & Drop your CV here
                  </h3>
                  <p className="font-body text-[14px] text-secondary">
                    Supports .PDF, .DOC, and .DOCX formatting (Max 10MB)
                  </p>
                  
                  <div className="mt-4 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-headline font-bold text-[13px] shadow-sm pointer-events-auto">
                    Browse Files
                  </div>
                </div>
              </div>
            )}

            {(uploadState === "uploading" || uploadState === "processing") && (
              <div className="border border-outline-variant/50 rounded-xl p-8 bg-surface-container-lowest shadow-sm flex flex-col items-center text-center gap-5">
                <Loader2 size={40} className="text-primary animate-spin mb-2" />
                
                <div className="w-full max-w-[400px]">
                  <h3 className="font-headline text-[16px] font-bold text-primary mb-1">
                    Processing CV
                  </h3>
                  <p className="font-body text-[13px] text-secondary mb-5">
                    {statusText}
                  </p>
                  
                  <div className="h-[8px] w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 font-label text-[11px] font-bold text-outline">
                    <span>{file?.name}</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </div>
            )}

            {uploadState === "success" && (
              <div className="border border-green-200 rounded-xl p-8 bg-green-50 shadow-sm flex flex-col items-center text-center gap-5">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 size={32} />
                </div>
                
                <div>
                  <h3 className="font-headline text-[20px] font-bold text-green-900 mb-1">
                    Extraction Successful!
                  </h3>
                  <p className="font-body text-[14px] text-green-800/80 max-w-[450px] mx-auto">
                    We successfully mapped 4 publications, 1 education block, and 12 research keywords from your CV. 
                  </p>
                </div>

                <div className="mt-4">
                  <Link 
                    href="/faculty/editor"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-lg font-headline text-[14px] font-bold shadow-sm transition-colors hover:bg-green-800 active:scale-95"
                  >
                    Review in Editor <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </FacultyLayout>
  );
}
