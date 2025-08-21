import Client from 'shopify-buy';

// Initialize Shopify client
let shopifyClient: any = null;

export const initializeShopify = () => {
  if (!import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || !import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    console.warn('Shopify credentials not configured');
    return null;
  }

  if (!shopifyClient) {
    shopifyClient = Client.buildClient({
      domain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
      storefrontAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    });
  }
  
  return shopifyClient;
};

export const getShopifyClient = () => {
  return shopifyClient || initializeShopify();
};

// Product configuration for metal cards
export const METAL_CARD_PRODUCTS = {
  'standard-metal': {
    name: 'Standard Metal Business Cards',
    price: 4.00,
    description: 'Professional thin metal business cards with QR code integration',
  },
  'color-metal': {
    name: 'Color Metal Business Cards',
    price: 5.00,
    description: 'Eye-catching color metal cards in red, blue, green, pink, orange, purple',
  },
  'black-metal': {
    name: 'Black Anodized Metal Business Cards',
    price: 7.00,
    description: 'Sleek black anodized metal business cards with premium finish - 0.5mm thickness',
  },
  'luxury-metal': {
    name: 'Luxury Titanium Business Cards',
    price: 9.00,
    description: 'Premium titanium metal business cards for ultimate durability',
  },
};

// Delivery options with fees
export const DELIVERY_OPTIONS = {
  'standard': {
    name: 'Standard Delivery',
    price: 0,
    description: 'Regular shipping - 5-7 business days',
  },
  'rush-24h': {
    name: '24 Hour Rush Delivery',
    price: 30,
    description: 'Rush shipping within 24 hours',
  },
  'same-day-manhattan': {
    name: 'Same Day Manhattan Courier',
    price: 50,
    description: 'Same day delivery anywhere in Manhattan via courier',
  },
};

// Get all products from Shopify store
export const getProducts = async () => {
  const client = getShopifyClient();
  if (!client) {
    throw new Error('Shopify client not initialized');
  }

  try {
    const products = await client.product.fetchAll();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Create checkout with custom line items
export const createCheckout = async (orderData: any) => {
  const client = getShopifyClient();
  if (!client) {
    throw new Error('Shopify client not initialized');
  }

  try {
    // Create a checkout
    const checkout = await client.checkout.create();
    
    // Calculate total based on card type, quantity, and delivery
    const cardType = METAL_CARD_PRODUCTS[orderData.cardType as keyof typeof METAL_CARD_PRODUCTS];
    const deliveryOption = DELIVERY_OPTIONS[orderData.deliveryOption as keyof typeof DELIVERY_OPTIONS];
    const subtotal = cardType.price * orderData.quantity;
    const total = subtotal + deliveryOption.price;
    
    // Get products from store to find the right variant
    const products = await getProducts();
    
    // Find a generic product or create a custom line item
    // For now, we'll use the first product as a placeholder
    let variantId = null;
    if (products.length > 0) {
      variantId = products[0].variants[0].id;
    }
    
    if (!variantId) {
      throw new Error('No products found in Shopify store. Please add a product first.');
    }
    
    const lineItemsToAdd = [{
      variantId: variantId,
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
        { key: 'delivery_fee', value: deliveryOption.price.toFixed(2) },
      ]
    }];

    const checkoutWithLineItems = await client.checkout.addLineItems(checkout.id, lineItemsToAdd);
    
    return checkoutWithLineItems;
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
};

// Create a direct checkout URL with custom pricing
export const createDirectCheckout = async (orderData: any) => {
  const client = getShopifyClient();
  if (!client) {
    throw new Error('Shopify client not initialized');
  }

  try {
    const checkout = await createCheckout(orderData);
    return checkout.webUrl;
  } catch (error) {
    console.error('Error creating direct checkout:', error);
    throw error;
  }
};

// Helper to check if Shopify is configured
export const isShopifyConfigured = () => {
  const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  
  console.log('Shopify Config Check:', {
    domain: domain ? 'Set' : 'Missing',
    token: token ? 'Set' : 'Missing'
  });
  
  return !!(domain && token);
};