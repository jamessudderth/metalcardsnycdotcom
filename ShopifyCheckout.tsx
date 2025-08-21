import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { getShopifyClient, METAL_CARD_PRODUCTS, DELIVERY_OPTIONS, isShopifyConfigured } from '@/lib/shopify';
import { useToast } from '@/hooks/use-toast';

interface ShopifyCheckoutProps {
  orderData: {
    customerName: string;
    email: string;
    phone: string;
    companyName?: string;
    position: string;
    quantity: number;
    cardType: string;
    cardStyle: string;
    deliveryOption: string;
    specialRequests?: string;
  };
  onBack: () => void;
}

export const ShopifyCheckout = ({ orderData, onBack }: ShopifyCheckoutProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const cardProduct = METAL_CARD_PRODUCTS[orderData.cardType as keyof typeof METAL_CARD_PRODUCTS];
  const deliveryOption = DELIVERY_OPTIONS[orderData.deliveryOption as keyof typeof DELIVERY_OPTIONS];
  const subtotal = cardProduct.price * orderData.quantity;
  const deliveryFee = deliveryOption.price;
  const tax = (subtotal + deliveryFee) * 0.08; // 8% tax rate
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = async () => {
    if (!isShopifyConfigured()) {
      toast({
        title: "Payment Processing Unavailable",
        description: "Shopify integration is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const client = getShopifyClient();
      if (!client) {
        throw new Error('Shopify client not initialized');
      }

      // Create checkout
      const checkout = await client.checkout.create();
      
      // For now, we'll redirect to a generic product
      // In a real implementation, you'd create specific products in Shopify
      const lineItemsToAdd = [{
        variantId: 'gid://shopify/ProductVariant/YOUR_VARIANT_ID', // Replace with actual variant ID
        quantity: 1,
        customAttributes: [
          { key: 'card_type', value: orderData.cardType },
          { key: 'card_style', value: orderData.cardStyle },
          { key: 'quantity', value: orderData.quantity.toString() },
          { key: 'delivery_option', value: orderData.deliveryOption },
          { key: 'customer_name', value: orderData.customerName },
          { key: 'email', value: orderData.email },
          { key: 'phone', value: orderData.phone },
          { key: 'position', value: orderData.position },
          { key: 'company_name', value: orderData.companyName || '' },
          { key: 'special_requests', value: orderData.specialRequests || '' },
          { key: 'calculated_total', value: total.toFixed(2) },
          { key: 'delivery_fee', value: deliveryFee.toFixed(2) },
        ]
      }];

      const checkoutWithLineItems = await client.checkout.addLineItems(checkout.id, lineItemsToAdd);
      
      // Redirect to Shopify checkout
      window.location.href = checkoutWithLineItems.webUrl;
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "Unable to process payment. Please try again or contact support.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Summary
          </CardTitle>
          <CardDescription>
            Review your order before proceeding to payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{cardProduct.name}</h3>
                <p className="text-sm text-muted-foreground">{cardProduct.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{orderData.cardStyle}</Badge>
                  <Badge variant="outline">{orderData.quantity} cards</Badge>
                  <Badge variant="outline">{deliveryOption.name}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${cardProduct.price.toFixed(2)} each</p>
                <p className="text-sm text-muted-foreground">×{orderData.quantity}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-2">
            <h4 className="font-semibold">Customer Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {orderData.customerName}</p>
                <p><strong>Email:</strong> {orderData.email}</p>
                <p><strong>Phone:</strong> {orderData.phone}</p>
              </div>
              <div>
                <p><strong>Position:</strong> {orderData.position}</p>
                {orderData.companyName && (
                  <p><strong>Company:</strong> {orderData.companyName}</p>
                )}
              </div>
            </div>
            {orderData.specialRequests && (
              <div>
                <p><strong>Special Requests:</strong></p>
                <p className="text-sm text-muted-foreground">{orderData.specialRequests}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({orderData.quantity} cards)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery ({deliveryOption.name})</span>
              <span>${deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'Free'}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Security Features */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure payment processing through Shopify</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>Digital profile setup included</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1"
        >
          Back to Order Form
        </Button>
        <Button 
          onClick={handleCheckout}
          disabled={isProcessing}
          className="flex-1"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </div>

      {/* Payment Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>What happens next:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>You'll be redirected to our secure Shopify checkout</li>
              <li>Complete your payment with credit card, PayPal, or other methods</li>
              <li>Receive order confirmation and production timeline</li>
              <li>We'll send design proofs within 24 hours</li>
              <li>Production begins after proof approval</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};