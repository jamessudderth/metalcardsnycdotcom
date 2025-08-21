import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileUpload } from '@/components/ui/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Upload, Send, Star, ShoppingCart, CreditCard } from 'lucide-react';
import { ShopifyCheckout } from '@/components/ShopifyCheckout';
import { isShopifyConfigured, DELIVERY_OPTIONS } from '@/lib/shopify';

const orderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  companyName: z.string().optional(),
  position: z.string().min(2, "Position must be at least 2 characters"),
  quantity: z.coerce.number().min(50, "Minimum order is 50 cards"),
  cardType: z.string().min(1, "Please select a card type"),
  cardStyle: z.string().min(1, "Please select a card style"),
  deliveryOption: z.string().min(1, "Please select a delivery option"),
  specialRequests: z.string().optional(),
});

type OrderData = z.infer<typeof orderSchema>;

const cardTypes = [
  { value: "standard-metal", label: "Thin Metal Cards - Standard Metal", price: "$4.00/card" },
  { value: "color-metal", label: "Eye catching color metal cards - red, blue, green, pink, orange, purple", price: "$5.00/card" },
  { value: "black-metal", label: "Black Metal - Anodized 0.5mm thickness", price: "$7.00/card" },
  { value: "luxury-metal", label: "Luxury Metal - Titanium", price: "$9.00/card" },
];

const cardStyles = [
  { value: "minimal", label: "Minimal" },
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "sleek", label: "Sleek" },
];

export default function OrderForm() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const { toast } = useToast();

  const form = useForm<OrderData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: '',
      email: '',
      phone: '',
      companyName: '',
      position: '',
      quantity: 100,
      cardType: '',
      cardStyle: '',
      deliveryOption: '',
      specialRequests: '',
    },
  });

  const submitOrderMutation = useMutation({
    mutationFn: async (data: OrderData & { logoFile?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'logoFile' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      if (data.logoFile) {
        formData.append('logo', data.logoFile);
      }
      
      const response = await fetch('/api/orders/submit', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit order');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Submitted Successfully!",
        description: "You'll receive a price quote via email within 24 hours.",
      });
      form.reset();
      setLogoFile(null);
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderData) => {
    if (isShopifyConfigured()) {
      // Store order data and show checkout
      setOrderData(data);
      setShowCheckout(true);
    } else {
      // Fallback to original order submission
      submitOrderMutation.mutate({ ...data, logoFile: logoFile || undefined });
    }
  };

  const handleBackToForm = () => {
    setShowCheckout(false);
    setOrderData(null);
  };

  const handleLogoUpload = async (file: File) => {
    setLogoFile(file);
  };

  // Show checkout if Shopify is configured and user has submitted order
  if (showCheckout && orderData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Complete Your Order</h1>
              <p className="text-xl text-muted-foreground">
                Review your order details and proceed to secure payment
              </p>
            </div>
            <ShopifyCheckout 
              orderData={orderData} 
              onBack={handleBackToForm}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Order Custom Metal Business Cards</h1>
            <p className="text-xl text-muted-foreground">
              Professional metal business cards with digital QR profiles. {isShopifyConfigured() ? 'Secure payment processing available!' : 'Get your custom quote today!'}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Order Details
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below to receive a custom price quote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@company.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Company LLC" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position/Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="CEO, Marketing Director, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input type="number" min="50" placeholder="100" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cardType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select metal type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cardTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label} - {type.price}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="cardStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Style *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select design style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cardStyles.map((style) => (
                                  <SelectItem key={style.value} value={style.value}>
                                    {style.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryOption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Option *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select delivery option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(DELIVERY_OPTIONS).map(([key, option]) => (
                                  <SelectItem key={key} value={key}>
                                    {option.name} {option.price > 0 && `(+$${option.price})`} - {option.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <label className="block text-sm font-medium mb-2">Logo Upload</label>
                        <FileUpload
                          onUpload={handleLogoUpload}
                          accept=".png,.jpg,.jpeg,.svg,.pdf"
                          maxSize={10}
                          label="Upload your logo (PNG, JPG, SVG, or PDF)"
                          variant="logo"
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="specialRequests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Requests or Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special requirements, color preferences, or additional information..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={submitOrderMutation.isPending}
                      >
                        {submitOrderMutation.isPending ? (
                          "Processing..."
                        ) : (
                          <>
                            {isShopifyConfigured() ? (
                              <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Continue to Checkout
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit Order & Get Quote
                              </>
                            )}
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cardTypes.map((type) => (
                    <div key={type.value} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{type.label.split(' - ')[1]}</p>
                        <p className="text-sm text-muted-foreground">{type.label.split(' - ')[0]}</p>
                      </div>
                      <p className="font-bold text-primary">{type.price}</p>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      * Final pricing may vary based on design complexity and special requirements
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(DELIVERY_OPTIONS).map(([key, option]) => (
                    <div key={key} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <p className="font-bold text-primary">
                        {option.price > 0 ? `+$${option.price}` : 'Free'}
                      </p>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      * Same day Manhattan delivery available for orders placed before 12 PM
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Custom metal business cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">QR code linking to digital profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Professional design service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Free shipping (orders 100+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">24-48 hour turnaround</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}