
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MemoryUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if file is an image
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/i)) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, GIF, WEBP)",
          variant: "destructive",
        });
        return;
      }
      // Check if file is not too large (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      
      // Generate a unique filename to avoid conflicts
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('memories')
        .upload(fileName, selectedFile);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Upload successful",
        description: "Your memory has been added to the slideshow",
      });
      
      // Clear the selected file
      setSelectedFile(null);
      // Refresh the page to update the slideshow
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="neu-element-inset p-6">
        <h3 className="text-xl font-semibold mb-4">Upload a Memory</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById('memory-file-input')?.click()}
              disabled={uploading}
              className="relative"
            >
              <Upload size={16} className="mr-2" />
              Select Image
            </Button>
            
            {selectedFile && (
              <div className="flex items-center gap-2">
                <span className="text-sm truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearFile}
                  className="h-8 w-8"
                >
                  <X size={16} />
                </Button>
              </div>
            )}
            
            <input
              id="memory-file-input"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </div>
          
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? "Uploading..." : "Upload Memory"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemoryUploader;
