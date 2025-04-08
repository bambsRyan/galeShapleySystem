"use client";

import { useState } from "react";

interface AddFileProps {
  onInitialize: (file: File) => void;
  isLoading?: boolean;
}

export default function AddFile({
  onInitialize,
  isLoading = false,
}: AddFileProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file extension
    const validExtensions = [".xlsx", ".csv"];
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !validExtensions.includes(`.${fileExtension}`)) {
      setError("Please upload only .xlsx or .csv files");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    event.target.value = ""; // Reset input
  };

  const handleInitialize = () => {
    if (file) {
      onInitialize(file);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6 flex flex-col items-center gap-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-800">
            Upload your data file
          </h3>
          <p className="text-sm text-gray-500 mt-1">Supported formats: .xlsx</p>
        </div>

        <div className="relative w-full h-40">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="file-upload"
            className={`absolute inset-0 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              file
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-blue-400"
            } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <UploadIcon hasFile={!!file} />
            <span className="text-sm text-center px-4">
              {file ? (
                <span className="font-medium text-green-700 truncate max-w-xs">
                  {file.name}
                </span>
              ) : (
                <span className="text-gray-600">
                  Click to browse or drag and drop
                </span>
              )}
            </span>
          </label>
        </div>

        {error && (
          <div className="w-full text-sm text-red-600 px-4 py-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {file && (
          <button
            onClick={handleInitialize}
            disabled={isLoading}
            className={`w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Processing..." : "Initialize Data"}
          </button>
        )}
      </div>
    </div>
  );
}

function UploadIcon({ hasFile }: { hasFile: boolean }) {
  return (
    <svg
      className={`w-10 h-10 ${hasFile ? "text-green-500" : "text-gray-400"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {hasFile ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      )}
    </svg>
  );
}
