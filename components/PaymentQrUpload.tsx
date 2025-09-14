import { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { Button } from './ui/button';

interface PaymentQrUploadProps {
  projectId: string;
  onUpload: (file: File) => Promise<void>;
  currentQrCode?: string;
  onRemove: () => Promise<void>;
}

export function PaymentQrUpload({ projectId, onUpload, currentQrCode, onRemove }: PaymentQrUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentQrCode || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      setPreviewUrl(URL.createObjectURL(file));
      await onUpload(file);
    } catch (error) {
      console.error('Error uploading QR code:', error);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove the QR code?')) return;
    
    try {
      await onRemove();
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error removing QR code:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-blue-200">Payment QR Code</h3>
        {!previewUrl && (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-900/30 border-blue-700/50 text-blue-100 hover:bg-blue-800/50 hover:border-blue-600/50"
            >
              <Upload className="h-4 w-4 mr-2 text-cyan-300" />
              {isUploading ? 'Uploading...' : 'Upload QR Code'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="relative group">
          <div className="border border-blue-700/50 rounded-lg p-4 bg-blue-900/30 backdrop-blur-sm">
            <div className="p-2 bg-blue-950/50 rounded-md">
              <img
                src={previewUrl}
                alt="Payment QR Code"
                className="w-full max-w-xs h-auto mx-auto"
              />
            </div>
            <div className="mt-3 flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-800/30 border-blue-700/50 text-blue-100 hover:bg-blue-800/50 hover:border-blue-600/50"
              >
                <Upload className="h-4 w-4 mr-2 text-cyan-300" />
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
                className="bg-red-900/30 border-red-800/50 text-red-100 hover:bg-red-900/50 hover:border-red-700/50"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
