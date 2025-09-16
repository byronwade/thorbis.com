/**
 * Payment Method Manager Component
 * Manages payment methods with Stripe integration
 * Dark-first design with secure payment handling
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CreditCard,
  Plus,
  Check,
  X,
  AlertCircle,
  Shield,
  Calendar,
  Trash2,
  Star
} from 'lucide-react';
import { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand?: 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay';
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  billingDetails?: {
    name?: string;
    email?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  };
}

interface PaymentMethodManagerProps {
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: () => void;
  onSetDefault: (paymentMethodId: string) => void;
  onRemovePaymentMethod: (paymentMethodId: string) => void;
  onUpdateBilling: () => void;
  isLoading?: boolean;
}

const cardBrandIcons = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
  discover: '💳',
  diners: '💳',
  jcb: '💳',
  unionpay: '💳',
};

const cardBrandColors = {
  visa: 'from-blue-600 to-blue-700',
  mastercard: 'from-red-600 to-red-700',
  amex: 'from-green-600 to-green-700',
  discover: 'from-orange-600 to-orange-700',
  diners: 'from-purple-600 to-purple-700',
  jcb: 'from-indigo-600 to-indigo-700',
  unionpay: 'from-teal-600 to-teal-700',
};

export function PaymentMethodManager({
  paymentMethods,
  onAddPaymentMethod,
  onSetDefault,
  onRemovePaymentMethod,
  onUpdateBilling,
  isLoading = false,
}: PaymentMethodManagerProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const getCardGradient = (brand?: string) => {
    if (!brand) return 'from-neutral-600 to-neutral-700';
    return cardBrandColors[brand as keyof typeof cardBrandColors] || 'from-neutral-600 to-neutral-700';
  };

  const handleRemoveConfirm = (paymentMethodId: string) => {
    onRemovePaymentMethod(paymentMethodId);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-neutral-100">
                Payment Methods
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Manage your payment methods and billing information
              </CardDescription>
            </div>
            <Button 
              onClick={onAddPaymentMethod}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="w-12 h-12 text-neutral-600 mb-4" />
              <div className="text-lg font-medium text-neutral-300 mb-2">
                No payment methods added
              </div>
              <div className="text-sm text-neutral-500 text-center mb-6 max-w-md">
                Add a payment method to ensure uninterrupted service and enable automatic billing.
              </div>
              <Button 
                onClick={onAddPaymentMethod}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card 
              key={method.id}
              className={`bg-neutral-900 transition-all duration-200 ${
                method.isDefault 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Card Visual */}
                    <div className={`relative w-16 h-10 rounded-lg bg-gradient-to-br ${getCardGradient(method.brand)} flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-lg">
                        {method.brand ? cardBrandIcons[method.brand] : '💳'}
                      </span>
                      {method.isDefault && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Card Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-neutral-100">
                          •••• •••• •••• {method.last4}
                        </span>
                        {method.isDefault && (
                          <Badge className="bg-yellow-600 text-white border-0 text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        {method.brand && (
                          <span>{formatCardBrand(method.brand)}</span>
                        )}
                        {method.expMonth && method.expYear && (
                          <span>Expires {formatExpiryDate(method.expMonth, method.expYear)}</span>
                        )}
                        {method.billingDetails?.name && (
                          <span>{method.billingDetails.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => onSetDefault(method.id)}
                        disabled={isLoading}
                        className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Set Default
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(method.id)}
                      disabled={isLoading || (paymentMethods.length === 1)}
                      className="border-red-700 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Billing Address */}
                {method.billingDetails?.address && (
                  <div className="mt-4 pt-4 border-t border-neutral-800">
                    <div className="text-sm text-neutral-400">
                      <div className="font-medium text-neutral-300 mb-1">Billing Address</div>
                      <div>
                        {method.billingDetails.address.line1}
                        {method.billingDetails.address.line2 && (
                          <span>, {method.billingDetails.address.line2}</span>
                        )}
                      </div>
                      <div>
                        {method.billingDetails.address.city}, {method.billingDetails.address.state} {method.billingDetails.address.postal_code}
                      </div>
                      <div>{method.billingDetails.address.country}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Security Notice */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <div className="text-sm font-medium text-neutral-200 mb-1">
                Your payment information is secure
              </div>
              <div className="text-sm text-neutral-400 mb-3">
                All payment methods are securely stored and processed by Stripe. We never store your full payment details on our servers.
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onUpdateBilling}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  Update Billing Information
                </Button>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Shield className="w-3 h-3" />
                  <span>256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-neutral-100">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Remove Payment Method
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to remove this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deleteConfirm && (
            <div className="py-4">
              {(() => {
                const method = paymentMethods.find(m => m.id === deleteConfirm);
                if (!method) return null;
                
                return (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                    <div className={`w-12 h-8 rounded bg-gradient-to-br ${getCardGradient(method.brand)} flex items-center justify-center`}>
                      <span className="text-white text-sm">
                        {method.brand ? cardBrandIcons[method.brand] : '💳'}
                      </span>
                    </div>
                    <div>
                      <div className="text-neutral-200 font-medium">
                        •••• •••• •••• {method.last4}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {method.brand && formatCardBrand(method.brand)}
                        {method.expMonth && method.expYear && (
                          <span> • Expires {formatExpiryDate(method.expMonth, method.expYear)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirm(null)}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => deleteConfirm && handleRemoveConfirm(deleteConfirm)}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PaymentMethodManager;