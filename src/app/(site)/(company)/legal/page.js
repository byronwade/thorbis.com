import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, 
  Shield, 
  FileText, 
  Users, 
  Eye, 
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail
} from 'lucide-react';
import { generateStaticPageMetadata } from '@/utils/server-seo';

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
  return await generateStaticPageMetadata({
    title: 'Legal Information - Terms, Privacy & Community Guidelines | Local Business Directory',
    description: 'Complete legal information including terms of service, privacy policy, community guidelines, content policies, and trust & safety measures.',
    path: '/legal',
    keywords: ['terms of service', 'privacy policy', 'community guidelines', 'content guidelines', 'trust safety', 'legal information', 'user agreement'],
  });
}

const lastUpdated = {
  terms: "December 15, 2024",
  privacy: "December 10, 2024",
  community: "November 28, 2024",
  content: "December 1, 2024",
  trust: "December 5, 2024"
};

const quickLinks = [
  {
    icon: Scale,
    title: "Terms of Service",
    description: "User agreement and platform rules",
    lastUpdated: lastUpdated.terms,
    section: "terms"
  },
  {
    icon: Shield,
    title: "Privacy Policy",
    description: "How we collect, use, and protect your data",
    lastUpdated: lastUpdated.privacy,
    section: "privacy"
  },
  {
    icon: Users,
    title: "Community Guidelines",
    description: "Rules for respectful community interaction",
    lastUpdated: lastUpdated.community,
    section: "community"
  },
  {
    icon: FileText,
    title: "Content Guidelines",
    description: "Standards for user-generated content",
    lastUpdated: lastUpdated.content,
    section: "content"
  },
  {
    icon: Lock,
    title: "Trust & Safety",
    description: "Our commitment to user safety and security",
    lastUpdated: lastUpdated.trust,
    section: "trust"
  }
];

const termsHighlights = [
  {
    title: "User Accounts",
    content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
  },
  {
    title: "Business Listings",
    content: "Business owners must provide accurate information and have the right to claim and manage their business listings."
  },
  {
    title: "User Content",
    content: "You retain ownership of content you submit but grant us license to use it in connection with our services."
  },
  {
    title: "Prohibited Uses",
    content: "Users may not engage in illegal activities, spam, harassment, or misrepresentation of businesses or services."
  },
  {
    title: "Limitation of Liability",
    content: "Our liability is limited to the maximum extent permitted by law. We provide the service 'as is' without warranties."
  }
];

const privacyHighlights = [
  {
    title: "Information We Collect",
    content: "We collect information you provide directly, automatically through your use of our services, and from third-party sources."
  },
  {
    title: "How We Use Information",
    content: "We use your information to provide services, improve our platform, communicate with you, and ensure security."
  },
  {
    title: "Information Sharing",
    content: "We don't sell personal information. We may share information with service providers, for legal compliance, or with your consent."
  },
  {
    title: "Data Security",
    content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access."
  },
  {
    title: "Your Rights",
    content: "You have rights to access, update, delete, and port your data, as well as opt-out of certain communications."
  }
];

const communityRules = [
  {
    title: "Be Respectful",
    description: "Treat all users with respect. No harassment, discrimination, or hate speech.",
    icon: Users
  },
  {
    title: "Be Honest",
    description: "Provide accurate information in reviews and business listings. No fake reviews or misleading content.",
    icon: CheckCircle
  },
  {
    title: "Be Safe",
    description: "Don't share personal information publicly. Report suspicious or harmful behavior.",
    icon: Shield
  },
  {
    title: "Follow Laws",
    description: "All content and activities must comply with applicable laws and regulations.",
    icon: Scale
  }
];

const contentStandards = [
  {
    category: "Reviews",
    standards: [
      "Based on genuine experiences",
      "Relevant to the business",
      "Free from promotional content",
      "Respectful language only"
    ]
  },
  {
    category: "Business Information",
    standards: [
      "Accurate and up-to-date",
      "Properly categorized",
      "Appropriate photos only",
      "Complete contact details"
    ]
  },
  {
    category: "User Profiles",
    standards: [
      "Real names preferred",
      "Appropriate profile photos",
      "Accurate location information",
      "Professional communication"
    ]
  }
];

const trustMeasures = [
  {
    icon: Shield,
    title: "Identity Verification",
    description: "Multi-step verification process for business owners and active reviewers"
  },
  {
    icon: Eye,
    title: "Content Moderation",
    description: "AI-powered and human moderation to ensure content quality and safety"
  },
  {
    icon: AlertTriangle,
    title: "Fraud Detection",
    description: "Advanced systems to detect and prevent fake reviews and fraudulent activities"
  },
  {
    icon: Lock,
    title: "Data Protection",
    description: "Enterprise-grade security measures to protect your personal and business data"
  }
];

function LegalHero() {
  return (
    <div className="bg-background border-b border-border transition-colors duration-200">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-primary/50 text-primary dark:text-primary/90 text-sm font-medium rounded-full mb-6">
            <Scale className="h-4 w-4" />
            Legal Center
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-4 tracking-tight">
            Legal Information
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Transparency is important to us. Find all our legal documents, policies, and guidelines in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 py-2.5 transition-all duration-200">
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent font-medium px-6 py-2.5 transition-all duration-200">
              <Mail className="h-4 w-4 mr-2" />
              Contact Legal Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickNavigation() {
  return (
    <section className="py-12 bg-muted/30 transition-colors duration-200">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">Quick Navigation</h2>
            <p className="text-muted-foreground">Jump to specific legal documents and policies</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickLinks.map((link, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-card border border-border group hover:border-primary/30">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
                    <link.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm text-foreground">{link.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{link.description}</p>
                  </div>
                  <div className="w-full pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground/60">Updated {link.lastUpdated}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LegalContent() {
  return (
    <section className="py-16 bg-background transition-colors duration-200">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="inline-flex h-auto p-1 bg-muted rounded-lg border border-border w-auto">
              <TabsTrigger value="terms" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-3 py-2 text-sm font-medium rounded-md transition-all duration-200">Terms</TabsTrigger>
                              <TabsTrigger value="privacy" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-3 py-2 text-sm font-medium rounded-md transition-all duration-200">Privacy</TabsTrigger>
                <TabsTrigger value="community" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-3 py-2 text-sm font-medium rounded-md transition-all duration-200">Community</TabsTrigger>
                <TabsTrigger value="content" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-3 py-2 text-sm font-medium rounded-md transition-all duration-200">Content</TabsTrigger>
                <TabsTrigger value="trust" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-3 py-2 text-sm font-medium rounded-md transition-all duration-200">Trust & Safety</TabsTrigger>
            </TabsList>
            
            <TabsContent value="terms" className="mt-6">
              <Card className="bg-card border border-border shadow-sm">
                <CardHeader className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-50 dark:bg-primary/50 rounded-lg">
                        <Scale className="h-4 w-4 text-primary dark:text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Terms of Service</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                          These terms govern your use of our platform and services.
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {lastUpdated.terms}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {termsHighlights.map((section, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors duration-200">
                        <h3 className="font-medium text-foreground mb-2">{section.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                      </div>
                    ))}
                    
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                      <h3 className="font-medium text-foreground mb-3">Key Points</h3>
                      <div className="grid gap-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success dark:text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">You must be 18 or older to use our services</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Business information must be accurate and current</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">We reserve the right to terminate accounts for violations</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Terms may be updated with 30 days notice</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-8">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-foreground">
                      <Shield className="h-6 w-6 text-primary" />
                      <span>Privacy Policy</span>
                    </CardTitle>
                    <Badge variant="outline" className="border-border text-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated {lastUpdated.privacy}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Learn how we collect, use, and protect your personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {privacyHighlights.map((section, index) => (
                      <div key={index} className="border-l-4 border-green-500 dark:border-green-400 pl-4 hover:bg-green-50 dark:hover:bg-success/10 rounded-r-lg transition-colors duration-200 p-3">
                        <h3 className="font-semibold mb-2 text-foreground">{section.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                      </div>
                    ))}
                    
                    <div className="bg-green-50 dark:bg-success/20 p-6 rounded-lg mt-8 border border-green-200 dark:border-green-800">
                      <h3 className="font-semibold mb-3 text-success dark:text-success/70">Your Data Rights:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-success dark:text-success flex-shrink-0" />
                          <span className="text-success dark:text-success/80">Access and download your data</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-success dark:text-success flex-shrink-0" />
                          <span className="text-success dark:text-success/80">Correct inaccurate information</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-success dark:text-success flex-shrink-0" />
                          <span className="text-success dark:text-success/80">Delete your account and data</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-success dark:text-success flex-shrink-0" />
                          <span className="text-success dark:text-success/80">Opt-out of marketing communications</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="community" className="mt-8">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-foreground">
                      <Users className="h-6 w-6 text-primary" />
                      <span>Community Guidelines</span>
                    </CardTitle>
                    <Badge variant="outline" className="border-border text-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated {lastUpdated.community}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Guidelines for creating a positive and respectful community environment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {communityRules.map((rule, index) => (
                      <Card key={index} className="border-l-4 border-primary bg-card hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <rule.icon className="h-6 w-6 text-primary mt-1" />
                            <div>
                              <h3 className="font-semibold mb-2 text-foreground">{rule.title}</h3>
                              <p className="text-muted-foreground text-sm">{rule.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h3 className="font-semibold mb-3 text-purple-900 dark:text-purple-100">Enforcement:</h3>
                    <p className="text-purple-800 dark:text-purple-200 mb-3">
                      Violations of community guidelines may result in:
                    </p>
                    <ul className="space-y-2 text-purple-800 dark:text-purple-200">
                      <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full"></span><span>Warning and content removal</span></li>
                      <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full"></span><span>Temporary account suspension</span></li>
                      <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full"></span><span>Permanent account termination</span></li>
                      <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full"></span><span>Legal action for severe violations</span></li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="mt-8">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-foreground">
                      <FileText className="h-6 w-6 text-primary" />
                      <span>Content Guidelines</span>
                    </CardTitle>
                    <Badge variant="outline" className="border-border text-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated {lastUpdated.content}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Standards and requirements for all user-generated content on our platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {contentStandards.map((category, index) => (
                      <div key={index}>
                        <h3 className="text-lg font-semibold mb-4 text-warning dark:text-warning">
                          {category.category} Standards
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {category.standards.map((standard, i) => (
                            <div key={i} className="flex items-center space-x-3 p-2 rounded hover:bg-orange-50 dark:hover:bg-warning/10 transition-colors duration-200">
                              <CheckCircle className="h-4 w-4 text-success dark:text-success flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{standard}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-orange-50 dark:bg-warning/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
                      <h3 className="font-semibold mb-3 text-warning dark:text-warning/70">Prohibited Content:</h3>
                      <div className="grid md:grid-cols-2 gap-3 text-warning dark:text-warning/80">
                        <div className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-warning dark:bg-warning/40 rounded-full"></span><span>Spam or irrelevant content</span></div>
                        <div className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-warning dark:bg-warning/40 rounded-full"></span><span>Fake or misleading information</span></div>
                        <div className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-warning dark:bg-warning/40 rounded-full"></span><span>Offensive or inappropriate material</span></div>
                        <div className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-warning dark:bg-warning/40 rounded-full"></span><span>Copyright-infringing content</span></div>
                        <div className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-warning dark:bg-warning/40 rounded-full"></span><span>Personal attacks or harassment</span></div>
                        <div className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-warning dark:bg-warning/40 rounded-full"></span><span>Promotional or advertising content</span></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trust" className="mt-8">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-foreground">
                      <Lock className="h-6 w-6 text-primary" />
                      <span>Trust & Safety</span>
                    </CardTitle>
                    <Badge variant="outline" className="border-border text-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated {lastUpdated.trust}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Our comprehensive approach to ensuring user safety and platform integrity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {trustMeasures.map((measure, index) => (
                      <Card key={index} className="border-l-4 border-primary bg-card hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <measure.icon className="h-6 w-6 text-primary mt-1" />
                            <div>
                              <h3 className="font-semibold mb-2 text-foreground">{measure.title}</h3>
                              <p className="text-muted-foreground text-sm">{measure.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="bg-red-50 dark:bg-destructive/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="font-semibold mb-3 text-destructive dark:text-destructive/70">Report Issues:</h3>
                    <p className="text-destructive dark:text-destructive/80 mb-4">
                      If you encounter any safety issues, inappropriate content, or suspicious activity:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" className="border-red-300 dark:border-red-600 text-destructive dark:text-destructive/90 hover:bg-red-50 dark:hover:bg-destructive/30">
                        Report Content
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-300 dark:border-red-600 text-destructive dark:text-destructive/90 hover:bg-red-50 dark:hover:bg-destructive/30">
                        Report User
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-300 dark:border-red-600 text-destructive dark:text-destructive/90 hover:bg-red-50 dark:hover:bg-destructive/30">
                        Emergency Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}

export default function LegalPage() {
  return (
    		<div className="min-h-screen bg-muted/30 transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Legal Information",
            "description": "Complete legal information including terms of service, privacy policy, community guidelines, content policies, and trust & safety measures.",
            "url": "/legal",
            "publisher": {
              "@type": "Organization",
              "name": "Local Business Directory"
            },
            "dateModified": "2024-12-15T00:00:00Z",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Legal Documents",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "Article",
                    "name": "Terms of Service",
                    "dateModified": "2024-12-15T00:00:00Z"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "Article",
                    "name": "Privacy Policy",
                    "dateModified": "2024-12-10T00:00:00Z"
                  }
                }
              ]
            }
          })
        }}
      />
      
      <LegalHero />
      <QuickNavigation />
      <LegalContent />
    </div>
  );
}

