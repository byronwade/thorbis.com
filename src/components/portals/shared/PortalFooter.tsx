'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortalFooterProps {
  portalType: 'restaurant' | 'auto' | 'retail' | 'hs';
  branding?: {
    primary_color?: string;
    store_name?: string;
  };
  organizationId: string;
  className?: string;
}

const portalTypeConfig = {
  restaurant: {
    supportEmail: 'restaurant-support@thorbis.com',
    supportPhone: '1-800-THORBIS',
    businessHours: 'Mon-Fri 6:00 AM - 10:00 PM EST',
    emergencySupport: '24/7 Emergency Line: 1-800-EMERGENCY',
    specificLinks: [
      { label: 'Menu Planning Resources', href: '/resources/menu-planning' },
      { label: 'Food Safety Guidelines', href: '/resources/food-safety' },
      { label: 'Supplier Directory', href: '/resources/suppliers' },
    ],
  },
  auto: {
    supportEmail: 'auto-support@thorbis.com',
    supportPhone: '1-800-AUTO-SVC',
    businessHours: 'Mon-Fri 7:00 AM - 7:00 PM EST, Sat 8:00 AM - 5:00 PM EST',
    emergencySupport: 'Emergency Roadside: 1-800-ROADSIDE',
    specificLinks: [
      { label: 'Maintenance Schedules', href: '/resources/maintenance' },
      { label: 'Warranty Information', href: '/resources/warranty' },
      { label: 'Recall Notices', href: '/resources/recalls' },
    ],
  },
  retail: {
    supportEmail: 'retail-support@thorbis.com',
    supportPhone: '1-800-SHOP-NOW',
    businessHours: 'Mon-Sun 8:00 AM - 10:00 PM EST',
    emergencySupport: 'Order Issues: 1-800-ORDER-HELP',
    specificLinks: [
      { label: 'Size Guide', href: '/resources/size-guide' },
      { label: 'Return Policy', href: '/resources/returns' },
      { label: 'Loyalty Program', href: '/resources/loyalty' },
    ],
  },
  hs: {
    supportEmail: 'homeservices-support@thorbis.com',
    supportPhone: '1-800-HOME-SVC',
    businessHours: 'Mon-Fri 7:00 AM - 8:00 PM EST, Sat-Sun 8:00 AM - 6:00 PM EST',
    emergencySupport: '24/7 Emergency Service: 1-800-EMERGENCY',
    specificLinks: [
      { label: 'Service Schedules', href: '/resources/service-schedules' },
      { label: 'Home Maintenance Tips', href: '/resources/maintenance-tips' },
      { label: 'Warranty Coverage', href: '/resources/warranty' },
    ],
  },
};

export function PortalFooter({
  portalType,
  branding,
  organizationId,
  className,
}: PortalFooterProps) {
  const [currentYear] = useState(new Date().getFullYear());
  
  const config = portalTypeConfig[portalType];
  const primaryColor = branding?.primary_color || '#1C8BFF';
  const storeName = branding?.store_name || 'Thorbis';

  return (
    <footer 
      className={cn(
        "border-t bg-neutral-50 dark:bg-neutral-900/50",
        className
      )}
      style={{
        borderTopColor: `${primaryColor}20',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" style={{ color: primaryColor }} />
              Customer Support
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                <div>
                  <div>{config.supportPhone}</div>
                  <div className="text-xs text-neutral-500">{config.businessHours}</div>
                </div>
              </div>
              
              <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                <a 
                  href={'mailto:${config.supportEmail}'}
                  className="hover:underline"
                  style={{ color: primaryColor }}
                >
                  {config.supportEmail}
                </a>
              </div>
              
              <div className="flex items-start text-neutral-600 dark:text-neutral-400">
                <Clock className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-medium text-red-600 dark:text-red-400">
                    Emergency Support
                  </div>
                  <div>{config.emergencySupport}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Industry-Specific Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
              <FileText className="mr-2 h-4 w-4" style={{ color: primaryColor }} />
              Resources
            </h3>
            
            <div className="space-y-2 text-sm">
              {config.specificLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  <ExternalLink className="mr-2 h-3 w-3" />
                  {link.label}
                </a>
              ))}
              
              <Separator className="my-3" />
              
              <a
                href="/portal/user-guide"
                className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <HelpCircle className="mr-2 h-3 w-3" />
                Portal User Guide
              </a>
              
              <a
                href="/portal/tutorials"
                className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Video Tutorials
              </a>
            </div>
          </div>

          {/* Account & Security */}
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
              <Shield className="mr-2 h-4 w-4" style={{ color: primaryColor }} />
              Account & Security
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="text-neutral-600 dark:text-neutral-400">
                <div className="font-medium">Portal Status</div>
                <Badge variant="outline" className="mt-1">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: '#22C55E' }}
                  />
                  Active Session
                </Badge>
              </div>
              
              <div className="text-neutral-600 dark:text-neutral-400">
                <div className="font-medium">Security Level</div>
                <div className="text-xs mt-1">
                  Encrypted Connection
                  <Badge variant="secondary" className="ml-2 text-xs">
                    SSL Secured
                  </Badge>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <a
                href="/portal/privacy"
                className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <FileText className="mr-2 h-3 w-3" />
                Privacy Policy
              </a>
              
              <a
                href="/portal/terms"
                className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <FileText className="mr-2 h-3 w-3" />
                Terms of Service
              </a>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
              <MapPin className="mr-2 h-4 w-4" style={{ color: primaryColor }} />
              {storeName}
            </h3>
            
            <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <div>
                <div className="font-medium">Business Management Platform</div>
                <div className="text-xs mt-1">
                  Serving {portalType} businesses nationwide
                </div>
              </div>
              
              <div>
                <div className="font-medium">Portal ID</div>
                <div className="text-xs font-mono mt-1">
                  {organizationId.split('-')[0]}...{organizationId.split('-')[4]}
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="text-xs">
                <div className="font-medium mb-2">Follow Us</div>
                <div className="flex space-x-4">
                  <a 
                    href="https://twitter.com/thorbis" 
                    className="hover:underline"
                    style={{ color: primaryColor }}
                  >
                    Twitter
                  </a>
                  <a 
                    href="https://linkedin.com/company/thorbis" 
                    className="hover:underline"
                    style={{ color: primaryColor }}
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center space-x-4">
            <div>
              © {currentYear} {storeName}. All rights reserved.
            </div>
            <Badge variant="outline" className="hidden md:inline-flex">
              Portal v2.0
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-xs">
              Powered by Thorbis Business OS
            </span>
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: primaryColor }}
              title="System Status: Operational"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}