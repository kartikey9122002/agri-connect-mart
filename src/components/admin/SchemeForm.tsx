
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schemeFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  eligibility: z.string().min(5, { message: 'Eligibility criteria must be at least 5 characters' }),
  benefits: z.string().min(5, { message: 'Benefits must be at least 5 characters' }),
  application_url: z.string().url({ message: 'Please enter a valid URL' }),
  category: z.string().min(1, { message: 'Please select a category' }),
});

type SchemeFormData = z.infer<typeof schemeFormSchema>;

interface SchemeFormProps {
  initialData?: SchemeFormData;
  onSubmit: (data: SchemeFormData) => void;
  isSubmitting: boolean;
}

const SchemeForm: React.FC<SchemeFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const form = useForm<SchemeFormData>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      eligibility: '',
      benefits: '',
      application_url: '',
      category: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter scheme title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="crop_insurance">Crop Insurance</SelectItem>
                  <SelectItem value="credit_subsidy">Credit & Subsidy</SelectItem>
                  <SelectItem value="marketing_support">Marketing Support</SelectItem>
                  <SelectItem value="irrigation">Irrigation Schemes</SelectItem>
                  <SelectItem value="technology">Technology Adoption</SelectItem>
                  <SelectItem value="storage">Storage & Warehousing</SelectItem>
                  <SelectItem value="organic_farming">Organic Farming</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter detailed description of the scheme" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="eligibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Eligibility Criteria</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter who is eligible for this scheme" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="benefits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benefits</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter the benefits provided by this scheme" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="application_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.gov.in/apply" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Scheme' : 'Add Scheme'}
        </Button>
      </form>
    </Form>
  );
};

export default SchemeForm;
