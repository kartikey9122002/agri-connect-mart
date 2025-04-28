
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Upload, X, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProductFormInputs {
  name: string;
  description: string;
  price: number;
  category: string;
}

const categories = [
  'Fruits',
  'Vegetables',
  'Grains',
  'Dairy',
  'Meat',
  'Honey & Syrup',
  'Herbs & Spices',
  'Nuts & Seeds',
  'Oils',
  'Other'
];

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormInputs>();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [imageError, setImageError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check if selecting these files would exceed the 5-image limit
      if (imageFiles.length + selectedFiles.length > 5) {
        setImageError('You can only upload up to 5 images');
        return;
      }
      
      setImageError('');
      
      // Create preview URLs
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      
      // Add to existing files and previews
      setImageFiles([...imageFiles, ...selectedFiles]);
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    // Release object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    setImageError('');
  };

  const uploadImages = async (productId: string): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Error uploading image ${i + 1}: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }

    return imageUrls;
  };

  const onSubmit = async (data: ProductFormInputs) => {
    // Validate image count
    if (imageFiles.length === 0) {
      setImageError('Please upload at least one image');
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication error',
        description: 'You must be logged in to add products',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add product to database
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          description: data.description,
          price: data.price,
          category: category,
          seller_id: user.id,
          status: 'pending', // Pending approval
          images: [] // Will update with image URLs after upload
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }

      // Upload images and get URLs
      const imageUrls = await uploadImages(product.id);

      // Update product with image URLs
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: imageUrls })
        .eq('id', product.id);

      if (updateError) {
        throw new Error(`Failed to update product with images: ${updateError.message}`);
      }

      toast({
        title: 'Product submitted',
        description: 'Your product has been submitted for admin approval.',
      });
      
      // Add a slight delay before navigation to ensure toast is visible
      setTimeout(() => {
        navigate('/seller-dashboard', { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'There was an error submitting your product. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

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
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Provide comprehensive information about your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    {...register('name', {
                      required: 'Product name is required',
                      maxLength: {
                        value: 100,
                        message: 'Product name cannot exceed 100 characters',
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product in detail"
                    rows={5}
                    className="resize-none"
                    {...register('description', {
                      required: 'Description is required',
                      minLength: {
                        value: 50,
                        message: 'Description should be at least 50 characters',
                      },
                    })}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter price per unit"
                      step="0.01"
                      min="0"
                      {...register('price', {
                        required: 'Price is required',
                        min: {
                          value: 0,
                          message: 'Price must be greater than 0',
                        },
                        valueAsNumber: true,
                      })}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!category && (
                      <p className="text-sm text-red-500">Category is required</p>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/seller-dashboard')}
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !category || imageFiles.length === 0}
                      className="bg-agrigreen-600 hover:bg-agrigreen-700"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
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
                    onChange={handleImageChange}
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
                  <span>{imageFiles.length} images uploaded</span>
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
                          onClick={() => removeImage(index)}
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
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Submission Guidelines</CardTitle>
              <CardDescription>
                Follow these guidelines for quick approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <div className="bg-agrigreen-100 text-agrigreen-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span>Provide accurate and detailed product information</span>
                </li>
                <li className="flex gap-2">
                  <div className="bg-agrigreen-100 text-agrigreen-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span>Upload clear, well-lit photos from multiple angles</span>
                </li>
                <li className="flex gap-2">
                  <div className="bg-agrigreen-100 text-agrigreen-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span>Set a fair market price</span>
                </li>
                <li className="flex gap-2">
                  <div className="bg-agrigreen-100 text-agrigreen-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span>Include details about farming methods if applicable</span>
                </li>
                <li className="flex gap-2">
                  <div className="bg-agrigreen-100 text-agrigreen-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span>Mention any certifications (organic, etc.)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
