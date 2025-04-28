
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ProductSubmissionGuidelines = () => {
  return (
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
  );
};

export default ProductSubmissionGuidelines;
