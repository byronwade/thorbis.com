import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Search, 
  HelpCircle, 
  BookOpen, 
  Users, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { generateStaticPageMetadata } from '@/utils/server-seo';

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
  return await generateStaticPageMetadata({
    title: 'Help Center - Get Support & Find Answers | Local Business Directory',
    description: 'Find answers to your questions, get support, and learn how to make the most of our local business platform. FAQ, guides, and contact options.',
    path: '/help',
    keywords: ['help center', 'support', 'FAQ', 'contact support', 'customer service', 'business help', 'local directory help'],
  });
}

// Consolidated FAQ data
const faqData = {
  general: [
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking the 'Sign Up' button in the top navigation. We support email registration as well as social login options."
    },
    {
      question: "Is the platform free to use?",
      answer: "Yes, basic features are free. We also offer premium plans for businesses that want advanced features like priority listing, analytics, and promotional tools."
    },
    {
      question: "How do I search for businesses?",
      answer: "Use the search bar at the top of any page. You can search by business name, category, or location. Use filters to narrow down your results."
    },
    {
      question: "Can I save my favorite businesses?",
      answer: "Yes, create an account and use the heart icon on any business listing to save it to your favorites for easy access later."
    }
  ],
  business: [
    {
      question: "How do I claim my business listing?",
      answer: "If your business already appears in our directory, you can claim it by searching for your business and clicking 'Claim This Business'. You'll need to verify ownership."
    },
    {
      question: "How do I add my business to the directory?",
      answer: "Click 'Add Business' in the navigation menu. Fill out your business information, upload photos, and verify your listing. It's free to get started."
    },
    {
      question: "How long does business verification take?",
      answer: "Business verification typically takes 1-3 business days. We'll send you updates via email throughout the process."
    },
    {
      question: "Can I manage multiple business locations?",
      answer: "Yes, our business dashboard allows you to manage multiple locations from a single account. Each location can have its own listing and information."
    }
  ],
  technical: [
    {
      question: "Why can't I log in to my account?",
      answer: "Try resetting your password first. If you're still having issues, clear your browser cache or try a different browser. Contact support if problems persist."
    },
    {
      question: "The website is loading slowly. What should I do?",
      answer: "Try refreshing the page or clearing your browser cache. If the issue persists, it might be a temporary server issue. Check our status page or contact support."
    },
    {
      question: "How do I update my account information?",
      answer: "Log in to your account and go to Settings. You can update your personal information, password, and notification preferences there."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for detailed information about data handling."
    }
  ]
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    contact: "support@localbusiness.com",
    responseTime: "Within 24 hours"
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our support team",
    contact: "Available 9 AM - 6 PM EST",
    responseTime: "Usually within minutes"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak with a support specialist",
    contact: "1-800-LOCAL-BIZ",
    responseTime: "Monday-Friday, 9 AM - 6 PM EST"
  }
];

const helpCategories = [
  {
    icon: Users,
    title: "For Users",
    description: "Finding and reviewing businesses",
    topics: ["Account Management", "Search & Discovery", "Reviews & Ratings", "Favorites & Lists"]
  },
  {
    icon: BookOpen,
    title: "For Business Owners",
    description: "Managing your business presence",
    topics: ["Claiming Your Business", "Managing Listings", "Customer Engagement", "Analytics & Insights"]
  },
  {
    icon: Zap,
    title: "Platform Features",
    description: "Making the most of our tools",
    topics: ["Mobile App", "Notifications", "Integration", "Advanced Features"]
  }
];

function HelpHero() {
  return (
    <div className="bg-background border-b border-border transition-colors duration-200">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success dark:bg-success/50 text-success dark:text-success/90 text-sm font-medium rounded-full mb-6">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-4 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Find answers, get support, and learn how to make the most of our platform
          </p>
          <div className="max-w-lg relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search for help topics..." 
              className="pl-11 pr-4 py-3 text-foreground bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-sm transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickHelp() {
  return (
    <section className="py-12 bg-muted/30 transition-colors duration-200">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">Quick Help</h2>
            <p className="text-muted-foreground">Choose your category to get started</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-all duration-200 bg-card border border-border group hover:border-primary/30">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
                    <category.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  {category.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <span className="text-sm text-muted-foreground">{topic}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full text-sm font-medium border-border text-foreground hover:bg-muted">
                  Explore {category.title}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="py-16 bg-background transition-colors duration-200">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Find answers to common questions</p>
          </div>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="inline-flex h-auto p-1 bg-muted rounded-lg border border-border w-auto">
              <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-4 py-2 text-sm font-medium rounded-md transition-all duration-200">General</TabsTrigger>
              <TabsTrigger value="business" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-4 py-2 text-sm font-medium rounded-md transition-all duration-200">For Businesses</TabsTrigger>
              <TabsTrigger value="technical" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-4 py-2 text-sm font-medium rounded-md transition-all duration-200">Technical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-6">
              <div className="space-y-3">
                {faqData.general.map((faq, index) => (
                  <Card key={index} className="bg-card border border-border hover:border-primary/30 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg flex-shrink-0">
                          <HelpCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-medium text-foreground">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="business" className="mt-6">
              <div className="space-y-3">
                {faqData.business.map((faq, index) => (
                  <Card key={index} className="bg-card border border-border hover:border-primary/30 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg flex-shrink-0">
                          <HelpCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-medium text-foreground">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="technical" className="mt-6">
              <div className="space-y-3">
                {faqData.technical.map((faq, index) => (
                  <Card key={index} className="bg-card border border-border hover:border-primary/30 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg flex-shrink-0">
                          <HelpCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-medium text-foreground">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}

function ContactSupport() {
  return (
    <section className="py-12 bg-muted/30 transition-colors duration-200">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">Contact Support</h2>
            <p className="text-muted-foreground">Get in touch with our support team</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Methods */}
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <Card key={index} className="p-4 hover:shadow-md transition-all duration-200 bg-card border border-border group hover:border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors duration-200">
                      <method.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-1">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                      <p className="text-sm text-primary font-medium mb-2">{method.contact}</p>
                      <span className="inline-flex items-center px-2 py-1 bg-muted text-xs text-muted-foreground rounded-md">
                        {method.responseTime}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <Card className="bg-card border border-border shadow-sm">
                              <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground">Send us a message</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">First Name</label>
                    <Input placeholder="John" className="h-9 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Last Name</label>
                    <Input placeholder="Doe" className="h-9 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" placeholder="john@example.com" className="h-9 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Input placeholder="How can we help you?" className="h-9 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea 
                    placeholder="Please describe your issue or question in detail..."
                    rows={4}
                    className="bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-9 transition-colors duration-200">
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              ...faqData.general,
              ...faqData.business,
              ...faqData.technical
            ].map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
      
      <HelpHero />
      <QuickHelp />
      <FAQSection />
      <ContactSupport />
    </div>
  );
}

