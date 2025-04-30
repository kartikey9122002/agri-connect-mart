
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { GovScheme } from '@/types';
import { Link } from 'react-router-dom';

interface SellerSchemesListProps {
  schemes: GovScheme[];
  isLoading: boolean;
}

const SellerSchemesList = ({ schemes, isLoading }: SellerSchemesListProps) => {
  const displayedSchemes = schemes.slice(0, 3); // Show only top 3 schemes

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
