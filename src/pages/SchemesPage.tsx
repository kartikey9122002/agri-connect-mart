import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, ArrowRight, Users, Tractor, Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GovScheme } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const categories = [
  'All Categories',
  'Financial Aid',
  'Market Access',
  'Insurance',
  'Agricultural Support',
  'Sustainable Farming',
  'Organic Farming'
];

const SchemesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<GovScheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch schemes from the database
  useEffect(() => {
    const fetchSchemes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('government_schemes')
          .select('*');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setSchemes(data as GovScheme[]);
          setFilteredSchemes(data as GovScheme[]);
        } else {
          // Use the mock data if no schemes are in the database yet
          useDefaultSchemes();
        }
      } catch (error) {
        console.error('Error fetching government schemes:', error);
        toast({
          title: 'Failed to load schemes',
          description: 'There was an error loading government schemes. Please try again.',
          variant: 'destructive',
        });
        // Use mock data as fallback
        useDefaultSchemes();
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemes();
  }, [toast]);

  // Use mock data temporarily until real data is available
  const useDefaultSchemes = () => {
    const defaultSchemes = [
      {
        id: '1',
        title: 'National Agriculture Market (e-NAM)',
        description: 'A pan-India electronic trading portal that networks existing agricultural markets to create a unified national market for agricultural commodities.',
        eligibility: 'All farmers, traders, and processors',
        benefits: 'Transparent price discovery, increased market access, reduced intermediaries',
        applicationUrl: '#',
        category: 'Market Access',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'PM Kisan Samman Nidhi Yojana',
        description: 'Financial benefit of ₹6000 per year in three equal installments to eligible farmer families.',
        eligibility: 'All land-holding farmers with certain exclusions',
        benefits: 'Direct financial support for agricultural expenses and household needs',
        applicationUrl: '#',
        category: 'Financial Aid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      // Keep a few default schemes for now - they will be replaced by real data later
      {
        id: '3',
        title: 'Soil Health Card Scheme',
        description: 'Government scheme to issue soil cards to farmers which will carry crop-wise recommendations of nutrients and fertilizers required.',
        eligibility: 'All farmers with agricultural land',
        benefits: 'Improved soil health, optimized fertilizer usage, higher crop yields',
        applicationUrl: '#',
        category: 'Agricultural Support',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    setSchemes(defaultSchemes);
    setFilteredSchemes(defaultSchemes);
  };

  // Filter schemes based on search and category
  useEffect(() => {
    if (schemes.length > 0) {
      const filtered = schemes.filter(scheme => {
        const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All Categories' || scheme.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      });
      setFilteredSchemes(filtered);
    }
  }, [searchTerm, selectedCategory, schemes]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-agrigreen-900">Government Agricultural Schemes</h1>
        <p className="text-gray-600">
          Explore various government initiatives and subsidies available for farmers and agricultural businesses.
        </p>
      </div>

      <div className="mb-8 bg-gradient-to-r from-agriorange-50 to-agrigreen-50 rounded-lg p-6 border border-agriorange-100">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold mb-3 text-agriorange-800">Find the Right Support for Your Farm</h2>
            <p className="text-gray-700 mb-4">
              Discover schemes tailored to your agricultural needs, from financial assistance and subsidies to market access and technical support.
            </p>
            <div className="relative">
              <Input
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                <div className="bg-agriorange-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-agriorange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Easy Applications</h3>
                  <p className="text-sm text-gray-500">Simple process to apply</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                <div className="bg-agrigreen-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-agrigreen-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Expert Support</h3>
                  <p className="text-sm text-gray-500">Guidance at every step</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={
              selectedCategory === category
                ? "bg-agrigreen-600 hover:bg-agrigreen-700"
                : "border-agrigreen-200 text-gray-700 hover:bg-agrigreen-50"
            }
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No schemes found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredSchemes.map((scheme) => (
            <Card key={scheme.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle>{scheme.title}</CardTitle>
                <CardDescription>{scheme.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">{scheme.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-agrigreen-600 mt-0.5" />
                    <p><span className="font-medium">Eligibility:</span> {scheme.eligibility}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tractor className="h-4 w-4 text-agrigreen-600 mt-0.5" />
                    <p><span className="font-medium">Benefits:</span> {scheme.benefits}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button 
                  variant="outline" 
                  className="border-agrigreen-500 text-agrigreen-600 hover:bg-agrigreen-50"
                  asChild
                >
                  <Link to={`/schemes/${scheme.id}`}>
                    View Details <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button className="bg-agriorange-500 hover:bg-agriorange-600" asChild>
                  <a href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer">
                    Apply Now
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <div className="mt-12 bg-agrigreen-800 text-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Need Help with Applications?</h2>
            <p className="mb-6">
              Our team can guide you through the application process for any government scheme. Get expert assistance to maximize your chances of approval.
            </p>
            <Button className="bg-white text-agrigreen-800 hover:bg-gray-100">
              Get Expert Assistance <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-agrigreen-700 p-8">
            <h3 className="text-xl font-semibold mb-4">Common Questions</h3>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <div className="bg-white text-agrigreen-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                  ?
                </div>
                <p>How long does the application process take?</p>
              </li>
              <li className="flex gap-2">
                <div className="bg-white text-agrigreen-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                  ?
                </div>
                <p>What documents do I need to apply?</p>
              </li>
              <li className="flex gap-2">
                <div className="bg-white text-agrigreen-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                  ?
                </div>
                <p>How will I receive the scheme benefits?</p>
              </li>
            </ul>
            <Button className="mt-6 bg-transparent border border-white hover:bg-agrigreen-600">
              View FAQ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemesPage;
