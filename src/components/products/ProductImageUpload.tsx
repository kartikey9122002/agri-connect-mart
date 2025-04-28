
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, X, Info } from 'lucide-react';

interface ProductImageUploadProps {
  imagePreviews: string[];
  imageError: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

const ProductImageUpload = ({
  imagePreviews,
  imageError,
  onImageChange,
  onRemoveImage
}: ProductImageUploadProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
        <CardDescription>
          Upload at least one image of your product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-md p-6 text-center ${
              imageError ? 'border-red-300' : 'border-gray-300'
            } hover:border-agrigreen-300 transition-colors`}
          >
            <Input
              type="file"
              id="productImages"
              className="hidden"
              accept="image/*"
              multiple
              onChange={onImageChange}
            />
            <Label htmlFor="productImages" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB each</p>
            </Label>
          </div>
          
          {imageError && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <Info className="h-4 w-4" />
              <span>{imageError}</span>
            </div>
          )}
          
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span>{imagePreviews.length} images uploaded</span>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {imagePreviews.map((preview, index) => (
                <div 
                  key={index} 
                  className="relative rounded-md overflow-hidden aspect-square bg-gray-50"
                >
                  <img 
                    src={preview} 
                    alt={`Product preview ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-50"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductImageUpload;
