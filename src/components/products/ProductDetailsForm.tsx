
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProductFormInputs {
  name: string;
  description: string;
  price: number;
  category: string;
}

interface ProductDetailsFormProps {
  onSubmit: (data: ProductFormInputs) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  category: string;
  onCategoryChange: (value: string) => void;
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

const ProductDetailsForm = ({
  onSubmit,
  isSubmitting,
  onCancel,
  category,
  onCategoryChange
}: ProductDetailsFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormInputs>();

  return (
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
              <Select value={category} onValueChange={onCategoryChange}>
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
                onClick={onCancel}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !category}
                className="bg-agrigreen-600 hover:bg-agrigreen-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductDetailsForm;
