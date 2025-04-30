
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import ProductDetailsForm from '@/components/products/ProductDetailsForm';
import ProductImageUpload from '@/components/products/ProductImageUpload';
import ProductSubmissionGuidelines from '@/components/products/ProductSubmissionGuidelines';
import { useProductImages } from '@/hooks/useProductImages';
import { useProductSubmission } from '@/hooks/useProductSubmission';
import useStorageSetup from '@/hooks/useStorageSetup';

const AddProduct = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const { isStorageReady } = useStorageSetup();
  const { imageFiles, imagePreviews, imageError, handleImageChange, removeImage, validateImages } = useProductImages();
  const { isSubmitting, submitProduct } = useProductSubmission();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    price: number;
  }) => {
    if (!validateImages()) return;
    
    await submitProduct(
      { ...data, category },
      imageFiles
    );
  };

  if (!isStorageReady) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Setting up storage...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2"
          onClick={() => navigate('/seller-dashboard')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-agrigreen-900">Add New Product</h1>
        <p className="text-gray-600">Fill in the details to add a new product for sale</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ProductDetailsForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => navigate('/seller-dashboard')}
            category={category}
            onCategoryChange={setCategory}
          />
        </div>

        <div>
          <ProductImageUpload
            imagePreviews={imagePreviews}
            imageError={imageError}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
          />
          <ProductSubmissionGuidelines />
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
