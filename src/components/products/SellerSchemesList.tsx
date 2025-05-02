
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { GovScheme } from '@/types';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SellerSchemesListProps {
  schemes?: GovScheme[];
  isLoading?: boolean;
}

const SellerSchemesList = ({ schemes = [], isLoading: initialLoading = false }: SellerSchemesListProps) => {
  const [displayedSchemes, setDisplayedSchemes] = useState<GovScheme[]>(schemes.slice(0, 3));
  const [isLoading, setIsLoading] = useState(initialLoading);
  const { toast } = useToast();

  useEffect(() => {
    if (schemes.length > 0) {
      setDisplayedSchemes(schemes.slice(0, 3));
      return;
    }
    
    const fetchSchemes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('schemes')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedSchemes: GovScheme[] = data.map(scheme => ({
            id: scheme.id,
            title: scheme.title,
            description: scheme.description,
            eligibility: scheme.eligibility,
            benefits: scheme.benefits,
            applicationUrl: scheme.application_url,
            category: scheme.category,
            createdAt: scheme.created_at,
            updatedAt: scheme.updated_at
          }));
          setDisplayedSchemes(formattedSchemes);
        }
      } catch (error: any) {
        console.error('Error fetching schemes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load government schemes',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchemes();
  }, [schemes, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Government Schemes</CardTitle>
        <CardDescription>
          Programs and subsidies relevant for your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : displayedSchemes.length > 0 ? (
          <div className="space-y-4">
            {displayedSchemes.map((scheme) => (
              <div key={scheme.id} className="border-b border-gray-100 pb-3 last:border-0">
                <h3 className="font-medium">{scheme.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{scheme.description}</p>
                <a 
                  href={scheme.applicationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-agrigreen-600 hover:underline mt-1 inline-flex items-center"
                >
                  Apply now <ChevronRight className="h-3 w-3 ml-1" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-gray-500">No relevant schemes available</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link to="/schemes" className="w-full">
          <Button variant="outline" className="w-full">
            View All Schemes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default SellerSchemesList;
