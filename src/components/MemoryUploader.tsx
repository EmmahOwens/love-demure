
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MemoryFormData {
  displayName: string;
  description: string;
  dateTaken: string;
  location: string;
}

const MemoryUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<MemoryFormData>({
    displayName: '',
    description: '',
    dateTaken: new Date().toISOString().split('T')[0],
    location: '',
  });
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
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setSelectedFile(file);
      
      // Auto-fill display name from file name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
      setFormData(prev => ({
        ...prev,
        displayName: nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1)
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.displayName) return;
    
    try {
      setUploading(true);
      
      // Generate a unique filename to avoid conflicts
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(fileName, selectedFile);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Store metadata in the memory_details table
      const { error: metadataError } = await supabase
        .from('memory_details')
        .insert({
          file_name: fileName,
          display_name: formData.displayName,
          description: formData.description || null,
          date_taken: formData.dateTaken ? new Date(formData.dateTaken) : null,
          location: formData.location || null
        });
        
      if (metadataError) {
        throw metadataError;
      }
      
      toast({
        title: "Upload successful",
        description: "Your memory has been added to the slideshow",
      });
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setFormData({
        displayName: '',
        description: '',
        dateTaken: new Date().toISOString().split('T')[0],
        location: '',
      });
      
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
    setPreview(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="neu-element-inset p-6">
        <h3 className="text-xl font-semibold mb-4">Upload a Memory</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            {preview && (
              <div className="relative aspect-video rounded-md overflow-hidden border border-border">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Title / Name</Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Give this memory a name"
                disabled={uploading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What makes this memory special?"
                disabled={uploading}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateTaken" className="flex items-center gap-1">
                  <Calendar size={14} />
                  Date Taken
                </Label>
                <Input
                  id="dateTaken"
                  name="dateTaken"
                  type="date"
                  value={formData.dateTaken}
                  onChange={handleInputChange}
                  disabled={uploading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin size={14} />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Where was this taken?"
                  disabled={uploading}
                />
              </div>
            </div>
            
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !formData.displayName || uploading}
              className="w-full mt-2"
            >
              {uploading ? "Uploading..." : "Upload Memory"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryUploader;
