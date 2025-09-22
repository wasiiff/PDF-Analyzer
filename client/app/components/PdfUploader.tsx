'use client';
import { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Database,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadPdfMutation } from '../services/pdfApi';

export default function PdfUploader({ onUpload }: { onUpload: (id: string) => void }) {
  const [uploadPdf, { isLoading }] = useUploadPdfMutation();
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;

    setError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadPdf(formData).unwrap();
      setUploadSuccess(true);
      setTimeout(() => onUpload(res._id), 1000);
    } catch (err) {
      console.error(err);
      setError('PDF upload failed. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      handleUpload(file);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">PDF Intelligence</h1>
              <p className="text-sm text-gray-500">Upload and analyze your documents</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Document</h2>
              <p className="text-gray-600 text-sm">Select a PDF file to start analyzing</p>
            </div>

            <div className="p-6">
              <label
                className={`relative block w-full cursor-pointer ${
                  isLoading || uploadSuccess ? 'pointer-events-none' : ''
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading || uploadSuccess}
                />

                <motion.div
                  className={`
                    relative rounded-xl border-2 border-dashed transition-all duration-200 p-8
                    ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
                    ${isLoading ? 'border-yellow-400 bg-yellow-50' : ''}
                    ${uploadSuccess ? 'border-green-400 bg-green-50' : ''}
                    ${error ? 'border-red-400 bg-red-50' : ''}
                  `}
                  whileHover={!isLoading && !uploadSuccess ? { scale: 1.01 } : {}}
                >
                  <div className="text-center">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <motion.div
                            className="w-12 h-12 mx-auto border-3 border-blue-200 border-t-blue-600 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">Processing...</p>
                            <p className="text-sm text-gray-500 mt-1">Uploading your document</p>
                          </div>
                        </motion.div>
                      ) : uploadSuccess ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Upload Complete</p>
                            <p className="text-sm text-gray-500 mt-1">Ready for analysis</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Drag & drop your PDF here
                            </p>
                            <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
                            <motion.div
                              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <FileText className="w-4 h-4" />
                              Select File
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </label>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Features + File Requirements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Features</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Secure Processing</p>
                    <p className="text-gray-600 text-xs mt-1">
                      Your documents are processed securely and privately
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Instant Analysis</p>
                    <p className="text-gray-600 text-xs mt-1">
                      Get answers and insights in real-time
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Smart Extraction</p>
                    <p className="text-gray-600 text-xs mt-1">
                      Advanced AI extracts key information automatically
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Requirements */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 text-sm mb-3">File Requirements</h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                  <div className="font-medium text-gray-900">Format</div>
                  <div className="text-gray-600 mt-1">PDF Only</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                  <div className="font-medium text-gray-900">Size</div>
                  <div className="text-gray-600 mt-1">Max 10MB</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                  <div className="font-medium text-gray-900">Quality</div>
                  <div className="text-gray-600 mt-1">High Res</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
