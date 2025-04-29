
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogTrigger, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogClose 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SchemeForm from '@/components/admin/SchemeForm';

interface Scheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  benefits: string;
  application_url: string;
  category: string;
  created_at: string;
}

const getCategoryBadgeClass = (category: string) => {
  switch (category) {
    case 'crop_insurance':
      return 'bg-blue-100 text-blue-800';
    case 'credit_subsidy':
      return 'bg-green-100 text-green-800';
    case 'marketing_support':
      return 'bg-purple-100 text-purple-800';
    case 'irrigation':
      return 'bg-sky-100 text-sky-800';
    case 'technology':
      return 'bg-indigo-100 text-indigo-800';
    case 'storage':
      return 'bg-amber-100 text-amber-800';
    case 'organic_farming':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatCategory = (category: string) => {
  return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const ManageSchemes = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, user, navigate, toast]);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const { data, error } = await supabase
          .from('schemes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSchemes(data || []);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: `Failed to fetch schemes: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchSchemes();
    }
  }, [isAuthenticated, user, toast]);

  const handleAddScheme = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('schemes')
        .insert([data]);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Scheme has been added successfully',
        variant: 'default',
      });
      
      // Refresh schemes list
      const { data: updatedSchemes, error: fetchError } = await supabase
        .from('schemes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setSchemes(updatedSchemes || []);
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to add scheme: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditScheme = async (data: any) => {
    if (!editingScheme) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('schemes')
        .update(data)
        .eq('id', editingScheme.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Scheme has been updated successfully',
        variant: 'default',
      });
      
      // Refresh schemes list
      const { data: updatedSchemes, error: fetchError } = await supabase
        .from('schemes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setSchemes(updatedSchemes || []);
      setIsEditDialogOpen(false);
      setEditingScheme(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update scheme: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteScheme = async () => {
    if (!schemeToDelete) return;
    
    try {
      const { error } = await supabase
        .from('schemes')
        .delete()
        .eq('id', schemeToDelete);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Scheme has been deleted successfully',
        variant: 'default',
      });
      
      // Update local state by removing the deleted scheme
      setSchemes(schemes.filter(scheme => scheme.id !== schemeToDelete));
      setSchemeToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete scheme: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  if (isLoading || loading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-agrigreen-900">Manage Schemes</h1>
          <p className="text-gray-600">Add and manage government schemes</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-agrigreen-600">
              <Plus className="mr-2 h-4 w-4" />
              Add New Scheme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Scheme</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new government scheme
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <SchemeForm 
                onSubmit={handleAddScheme}
                isSubmitting={isSubmitting}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>A list of all government schemes</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schemes.length > 0 ? (
              schemes.map((scheme) => (
                <TableRow key={scheme.id}>
                  <TableCell className="font-medium">{scheme.title}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryBadgeClass(scheme.category)}>
                      {formatCategory(scheme.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    {scheme.description.length > 100 
                      ? `${scheme.description.substring(0, 100)}...` 
                      : scheme.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingScheme(scheme)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {editingScheme && (
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Scheme</DialogTitle>
                              <DialogDescription>
                                Update the details of this scheme
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4">
                              <SchemeForm 
                                initialData={{
                                  title: editingScheme.title,
                                  description: editingScheme.description,
                                  eligibility: editingScheme.eligibility,
                                  benefits: editingScheme.benefits,
                                  application_url: editingScheme.application_url,
                                  category: editingScheme.category,
                                }}
                                onSubmit={handleEditScheme}
                                isSubmitting={isSubmitting}
                              />
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setSchemeToDelete(scheme.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              scheme from the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteScheme}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No schemes found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageSchemes;
