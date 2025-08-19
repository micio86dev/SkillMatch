import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Code, Users, Briefcase, MessageSquare, ArrowRight, CheckCircle, User } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const featuredProfessionals = [
    {
      name: "Sarah Chen",
      title: "Full-Stack Developer",
      rating: 4.9,
      reviews: 127,
      skills: ["React", "Node.js", "PostgreSQL"],
      bio: "Senior developer with 8+ years building scalable web applications. Specialized in modern React ecosystems and cloud architecture.",
      availability: "available",
      rate: 85,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
    },
    {
      name: "Michael Rodriguez",
      title: "DevOps Engineer",
      rating: 4.8,
      reviews: 89,
      skills: ["AWS", "Docker", "Kubernetes"],
      bio: "Cloud infrastructure specialist focused on automation and scalability. Expert in CI/CD pipelines and container orchestration.",
      availability: "partially_available",
      rate: 95,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
    },
    {
      name: "Emma Thompson",
      title: "UX/UI Designer",
      rating: 5.0,
      reviews: 156,
      skills: ["Figma", "Design Systems", "Prototyping"],
      bio: "Product designer passionate about creating intuitive user experiences. Specialized in design systems and user research.",
      availability: "available",
      rate: 75,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
    }
  ];

  const recentProjects = [
    {
      company: "FinTech Startup",
      location: "San Francisco, CA",
      title: "Senior React Developer",
      description: "Looking for an experienced React developer to build our next-generation trading platform. Must have experience with real-time data and financial systems.",
      skills: ["React", "TypeScript", "WebSocket"],
      hours: "120-150 hours",
      budget: "$8,000 - $12,000",
      status: "open",
      posted: "2 days ago"
    },
    {
      company: "E-commerce Platform",
      location: "Remote",
      title: "Full-Stack Team Lead",
      description: "Seeking a team lead to guide the development of our new marketplace. Leadership experience and e-commerce background preferred.",
      skills: ["Node.js", "MongoDB", "AWS"],
      hours: "200+ hours",
      budget: "$15,000 - $25,000",
      status: "open",
      posted: "1 week ago"
    },
    {
      company: "HealthTech Startup",
      location: "Boston, MA",
      title: "Mobile App Developer",
      description: "Building a revolutionary health monitoring app. Looking for React Native expert with healthcare industry experience.",
      skills: ["React Native", "Firebase", "Healthcare"],
      hours: "80-100 hours",
      budget: "$6,000 - $8,000",
      status: "in_review",
      posted: "3 days ago"
    }
  ];

  const testimonials = [
    {
      name: "David Kim",
      role: "Software Engineer",
      text: "DevConnect helped me find my dream remote job. The matching algorithm is incredibly accurate, and I love being part of such a supportive community.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80"
    },
    {
      name: "Rachel Martinez",
      role: "CTO, TechFlow Inc.",
      text: "We found an amazing development team through DevConnect. The quality of talent is exceptional, and the project estimation tool saved us so much time.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80"
    },
    {
      name: "Jennifer Park",
      role: "UX Designer",
      text: "The social features make networking feel natural. I've learned so much from other professionals and landed three great projects this year!",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80"
    }
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-400';
      case 'partially_available':
        return 'bg-yellow-400';
      default:
        return 'bg-red-400';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'partially_available':
        return 'Partially Available';
      default:
        return 'Unavailable';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-slate-100 dark:from-slate-800 dark:to-slate-900 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                  Connect.{" "}
                  <span className="text-primary">Collaborate.</span>{" "}
                  Create.
                </h1>
                <p className="text-xl text-slate-700 dark:text-slate-200 leading-relaxed">
                  The professional network where IT talent meets opportunity. Join thousands of developers, designers, and tech professionals building the future.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-4"
                  onClick={() => window.location.href = "/api/login"}
                >
                  <User className="mr-2 h-5 w-5" />
                  I'm a Professional
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-4"
                  onClick={() => window.location.href = "/api/login"}
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  I'm a Company
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">50K+</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">IT Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">12K+</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">25K+</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">Projects Completed</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Developer team collaboration in modern office" 
                className="rounded-2xl shadow-2xl w-full h-auto" 
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">2,847 professionals online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">Meet Top IT Professionals</h2>
            <p className="text-lg text-slate-700 dark:text-slate-200 max-w-2xl mx-auto">Connect with skilled developers, designers, and tech experts ready to bring your projects to life</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProfessionals.map((professional, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={professional.image} 
                      alt={professional.name}
                      className="w-16 h-16 rounded-full object-cover" 
                    />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{professional.name}</h3>
                      <p className="text-slate-700 dark:text-slate-300">{professional.title}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{professional.rating} ({professional.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {professional.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{professional.bio}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(professional.availability)}`} />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {getAvailabilityText(professional.availability)}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">${professional.rate}/hr</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/professionals">
              <Button size="lg">
                View All Professionals <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">How DevConnect Works</h2>
            <p className="text-lg text-slate-700 dark:text-slate-200 max-w-2xl mx-auto">Simple, smart, and efficient - connecting the right talent with the right opportunities</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <User className="text-2xl text-primary h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Create Your Profile</h3>
              <p className="text-slate-700 dark:text-slate-300">Build a comprehensive professional profile showcasing your skills, experience, and availability. Upload your CV and portfolio.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="text-2xl text-primary h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Smart Matching</h3>
              <p className="text-slate-700 dark:text-slate-300">Our AI-powered system matches professionals with relevant projects based on skills, experience level, and preferences.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="text-2xl text-primary h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Connect & Collaborate</h3>
              <p className="text-slate-700 dark:text-slate-300">Message directly, negotiate terms, and start working together. Rate and review each other after successful collaborations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Showcase */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">Recent Projects</h2>
            <p className="text-lg text-slate-700 dark:text-slate-200 max-w-2xl mx-auto">Discover exciting opportunities from companies looking for skilled IT professionals</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentProjects.map((project, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Briefcase className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{project.company}</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{project.location}</p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{project.title}</h4>
                  <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm">{project.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        Est. {project.hours}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{project.budget}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-700 dark:text-slate-300">Posted {project.posted}</span>
                    <Badge className={project.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}>
                      {project.status === 'open' ? 'Open' : 'In Review'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/projects">
              <Button size="lg">
                Browse All Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">Success Stories</h2>
            <p className="text-lg text-slate-700 dark:text-slate-200 max-w-2xl mx-auto">See how DevConnect has helped professionals and companies achieve their goals</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-8">
                  <div className="flex text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 mb-6">"{testimonial.text}"</p>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold text-white">Ready to Connect?</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Join thousands of IT professionals and companies who are already building the future together.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <Button 
                size="lg" 
                variant="secondary"
                className="flex-1 text-lg"
                onClick={() => window.location.href = "/api/login"}
              >
                <User className="mr-2 h-5 w-5" />
                Join as Professional
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1 text-lg border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => window.location.href = "/api/login"}
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Post a Project
              </Button>
            </div>

            <p className="text-white text-sm">Free to join • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Code className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold text-primary">DevConnect</span>
              </div>
              <p className="text-slate-400">Connecting IT professionals with opportunities worldwide. Build your career, grow your network.</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white">For Professionals</h3>
              <ul className="space-y-2">
                <li><Link href="/projects" className="text-slate-400 hover:text-white transition-colors">Find Projects</Link></li>
                <li><Link href="/profile" className="text-slate-400 hover:text-white transition-colors">Build Profile</Link></li>
                <li><Link href="/professionals" className="text-slate-400 hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white">For Companies</h3>
              <ul className="space-y-2">
                <li><Link href="/projects" className="text-slate-400 hover:text-white transition-colors">Post Projects</Link></li>
                <li><Link href="/professionals" className="text-slate-400 hover:text-white transition-colors">Browse Talent</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400">&copy; 2024 DevConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
