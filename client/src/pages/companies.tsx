import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Globe, Users, Briefcase, Search } from "lucide-react";
import { Link } from "wouter";

interface Company {
  id: string;
  companyName: string;
  description: string;
  industry: string;
  websiteUrl?: string;
  location?: string;
  companySize?: string;
  projectsCount?: number;
  user: {
    profileImageUrl?: string;
  };
}

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch = 
      company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = selectedIndustry === "all" || company.industry === selectedIndustry;
    
    return matchesSearch && matchesIndustry;
  });

  const industries = Array.from(new Set(companies.map((c: Company) => c.industry).filter(Boolean)));

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Companies & Customers
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Explore companies and their active projects. Connect with potential clients and discover new opportunities.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search companies by name, description, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company: Company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {company.user.profileImageUrl ? (
                        <img
                          src={company.user.profileImageUrl}
                          alt={company.companyName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {company.companyName}
                      </h3>
                      {company.industry && (
                        <Badge variant="secondary" className="mb-2">
                          {company.industry}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {company.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {company.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-4">
                        {company.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{company.location}</span>
                          </div>
                        )}
                        {company.companySize && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{company.companySize}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
                        <Briefcase className="h-4 w-4" />
                        <span>{company.projectsCount || 0} active projects</span>
                      </div>
                      <div className="flex space-x-2">
                        {company.websiteUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(company.websiteUrl, '_blank');
                            }}
                          >
                            <Globe className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href={`/companies/${company.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No companies found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm || selectedIndustry !== "all" 
                  ? "Try adjusting your search criteria" 
                  : "No companies have joined the platform yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}