import Link from 'next/link'
import Image from 'next/image'
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Youtube,
  Shield,
  Star,
  ShieldCheck,
  Award,
  Globe,
  ChevronDown,
  Apple,
  Smartphone,
  Briefcase
} from 'lucide-react'

export function MarketingFooter() {
  return (
    <footer className="relative w-full bg-neutral-900 text-white border-t border-neutral-800">
      <div className="px-4 py-16 lg:px-24">
        {/* Header section with logo and app downloads */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-16">
          {/* Logo and company info */}
          <div className="mb-8 lg:mb-0">
            <div className="flex items-center mb-4 space-x-4">
              <Image 
                alt="Thorbis" 
                width={60} 
                height={60} 
                className="w-auto h-12" 
                src="/logos/ThorbisLogo.webp"
              />
              <h1 className="text-3xl font-bold text-white">Thorbis</h1>
            </div>
            <p className="max-w-md text-lg leading-relaxed text-slate-300 mb-4">
              Connecting local businesses with their communities.
            </p>
            <p className="max-w-md text-base text-slate-400 mb-6">
              Empowering small businesses through innovative technology and community-first approach.
            </p>
            
            {/* Social media links */}
            <div className="flex space-x-3">
              <Link 
                href="https://twitter.com/localhub" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link 
                href="https://facebook.com/localhub" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link 
                href="https://instagram.com/localhub" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link 
                href="https://linkedin.com/company/localhub" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link 
                href="https://youtube.com/localhub" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </Link>
              <Link 
                href="#" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 640 512"
                >
                  <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"/>
                </svg>
              </Link>
            </div>
          </div>
          
          {/* App download section */}
          <div className="flex flex-col gap-3">
            <div className="text-sm font-medium text-slate-400 mb-2">Get the app</div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* App Store */}
              <Link 
                href="/mobile" 
                className="inline-flex items-center gap-3 rounded-2xl border px-6 py-4 bg-neutral-800 border-neutral-700 hover:bg-neutral-700 transition-colors text-white min-w-[160px]"
              >
                <Apple className="w-7 h-7" />
                <div className="text-left">
                  <div className="text-xs text-slate-400">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </Link>
              
              {/* Google Play */}
              <Link 
                href="/mobile" 
                className="inline-flex items-center gap-3 rounded-2xl border px-6 py-4 bg-neutral-800 border-green-500/30 hover:bg-neutral-700 transition-colors text-white min-w-[160px]"
              >
                <Smartphone className="w-7 h-7 text-green-500" />
                <div className="text-left">
                  <div className="text-xs text-slate-400">Get it on</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Trusted & Secure section */}
        <div className="mb-16">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Trusted &amp; Secure</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-green-500">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Privacy Shield</span>
            </div>
            <div className="flex items-center gap-2 text-blue-500">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">ISO 27001</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Star className="w-5 h-5" />
              <span className="text-sm font-medium">SOC2</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-500">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-medium">CCPA</span>
            </div>
            <div className="flex items-center gap-2 text-blue-500">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">GDPR</span>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <Briefcase className="w-5 h-5" />
              <span className="text-sm font-medium">HIPAA</span>
            </div>
          </div>
        </div>
        
        {/* Compare Alternatives section */}
        <div className="mb-16">
          <div className="mb-12 text-center">
            <h3 className="flex gap-3 justify-center items-center mb-4 text-2xl font-bold text-white">
              <svg 
                className="w-6 h-6 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
              </svg>
              Compare Alternatives
            </h3>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              See how Thorbis compares to other business platforms
            </p>
          </div>
          
          {/* Alternative platforms grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {[
              { name: 'vs Yelp', href: '/yelp-alternative', color: 'hover:bg-red-500/10 hover:border-red-500/30' },
              { name: 'vs Google', href: '/google-business-alternative', color: 'hover:bg-blue-500/10 hover:border-blue-500/30' },
              { name: 'vs TripAdvisor', href: '/tripadvisor-alternative', color: 'hover:bg-green-500/10 hover:border-green-500/30' },
              { name: "vs Angie's List", href: '/angies-list-alternative', color: 'hover:bg-slate-500/10 hover:border-slate-500/30' },
              { name: 'vs Booking', href: '/booking-alternative', color: 'hover:bg-blue-500/10 hover:border-blue-500/30' },
              { name: 'vs Expedia', href: '/expedia-alternative', color: 'hover:bg-yellow-500/10 hover:border-yellow-500/30' },
              { name: 'vs Yellow Pages', href: '/yellow-pages-alternative', color: 'hover:bg-yellow-500/10 hover:border-yellow-500/30' },
              { name: 'vs Bark', href: '/bark-alternative', color: 'hover:bg-green-500/10 hover:border-green-500/30' },
              { name: 'vs Thumbtack', href: '/thumbtack-alternative', color: 'hover:bg-slate-500/10 hover:border-slate-500/30' }
            ].map((platform, index) => (
              <Link 
                key={index}
                href={platform.href}
                className={'group flex flex-col items-center p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 transition-all ${platform.color}'}
              >
                <div className="w-8 h-8 text-white mb-2 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-center text-slate-300">
                  {platform.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Main footer navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
          {/* About */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">About</h3>
            <div className="space-y-2">
              <Link href="/company" className="block text-sm text-slate-400 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/jobs" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Careers
              </Link>
              <Link href="/company" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Press
              </Link>
              <Link href="/company" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Investor Relations
              </Link>
              <Link href="/legal" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Legal
              </Link>
            </div>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Support</h3>
            <div className="space-y-2">
              <Link href="/help" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Help Center
              </Link>
              <Link href="/help" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Contact Support
              </Link>
              <Link href="/help" className="block text-sm text-slate-400 hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/developers" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Developers
              </Link>
              <button className="block text-sm text-slate-400 hover:text-white transition-colors text-left w-full">
                📞 Advanced VOIP Demo
              </button>
            </div>
          </div>
          
          {/* Business */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Business</h3>
            <div className="space-y-2">
              <Link href="/pricing" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/business" className="block text-sm text-slate-400 hover:text-white transition-colors">
                For Business
              </Link>
              <Link href="/claim-a-business" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Claim Business
              </Link>
              <Link href="/advertise" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Advertise
              </Link>
              <Link href="/restaurant-owners" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Restaurant Owners
              </Link>
            </div>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Legal</h3>
            <div className="space-y-2">
              <Link href="/legal" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Legal
              </Link>
            </div>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Resources</h3>
            <div className="space-y-2">
              <Link href="/resources" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Resources Hub
              </Link>
              <Link href="/blog" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/resources#news" className="block text-sm text-slate-400 hover:text-white transition-colors">
                News
              </Link>
              <Link href="/resources#events" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Events
              </Link>
              <Link href="/partners" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Partners
              </Link>
            </div>
          </div>
          
          {/* Industries */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Industries</h3>
            <div className="space-y-2">
              <Link href="/discover#industries" className="block text-sm text-slate-400 hover:text-white transition-colors">
                All Industries
              </Link>
              <Link href="/field-management-software" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Field Management
              </Link>
              <Link href="/construction-management-software" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Construction
              </Link>
              <Link href="/retail-operations-platform" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Retail
              </Link>
              <Link href="/healthcare-operations-platform" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Healthcare
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom footer */}
        <div className="pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>© 2024 Thorbis. All rights reserved.</span>
              <span>•</span>
              <span>Made with love for local businesses</span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link href="/sitemap" className="text-sm text-slate-400 hover:text-white transition-colors">
                Sitemap
              </Link>
              <Link href="/status" className="text-sm text-slate-400 hover:text-white transition-colors">
                Status
              </Link>
              <Link href="/feedback" className="text-sm text-slate-400 hover:text-white transition-colors">
                Feedback
              </Link>
              
              {/* Language selector */}
              <button className="flex items-center gap-2 rounded-md border px-4 py-2 bg-white/10 border-white/30 hover:bg-blue-500/30 hover:border-blue-500/50 text-white transition-colors min-w-[120px]">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">🇺🇸</span>
                <span className="hidden md:inline">English</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}