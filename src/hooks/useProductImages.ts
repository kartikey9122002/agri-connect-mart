
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface ProductImage {
  file: File;
  preview: string;
}

export const useProductImages = (maxImages: number = 5) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState('');
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      if (imageFiles.length + selectedFiles.length > maxImages) {
        setImageError(`You can only upload up to ${maxImages} images`);
        return;
      }
      
      setImageError('');
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      
      setImageFiles(prev => [...prev, ...selectedFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    
    setImageError('');
  };

  const validateImages = () => {
    if (imageFiles.length === 0) {
      setImageError('Please upload at least one image');
      return false;
    }
    return true;
  };

  return {
    imageFiles,
    imagePreviews,
    imageError,
    handleImageChange,
    removeImage,
    validateImages,
  };
};
