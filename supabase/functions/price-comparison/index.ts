import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { productName, merchantId } = await req.json();

    if (!productName) {
      return new Response(
        JSON.stringify({ error: 'Product name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user ID from the auth header
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query line items for this product name (fuzzy matching with ILIKE)
    const { data: lineItems, error: queryError } = await supabaseClient
      .from('line_items')
      .select(`
        id,
        name,
        clean_name,
        unit_price,
        quantity,
        unit,
        discount,
        receipts!inner (
          id,
          merchant_name,
          purchase_date,
          user_id
        )
      `)
      .eq('receipts.user_id', user.id)
      .or(
        `clean_name.ilike.%${productName}%,name.ilike.%${productName}%`
      )
      .order('receipts.purchase_date', { ascending: false })
      .limit(50);

    if (queryError) {
      console.error('Query error:', queryError);
      return new Response(
        JSON.stringify({ error: queryError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lineItems || lineItems.length === 0) {
      return new Response(
        JSON.stringify({
          productName,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0,
          priceHistory: [],
          recommendations: ['No price history found for this product.'],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate statistics
    const prices = lineItems.map((item) => item.unit_price);
    const totalPrice = prices.reduce((sum, price) => sum + price, 0);
    const averagePrice = totalPrice / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Build price history
    const priceHistory = lineItems.map((item) => ({
      merchant: (item.receipts as any).merchant_name || 'Unknown',
      price: item.unit_price,
      date: (item.receipts as any).purchase_date,
      quantity: item.quantity,
      unit: item.unit || 'pcs',
    }));

    // Find cheapest merchant
    const merchantPrices = new Map<string, { prices: number[]; count: number }>();
    lineItems.forEach((item) => {
      const merchantName = (item.receipts as any).merchant_name || 'Unknown';
      const current = merchantPrices.get(merchantName) || { prices: [], count: 0 };
      current.prices.push(item.unit_price);
      current.count++;
      merchantPrices.set(merchantName, current);
    });

    const merchantAverages = Array.from(merchantPrices.entries()).map(
      ([merchant, data]) => ({
        merchant,
        avgPrice: data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length,
        count: data.count,
      })
    );
    merchantAverages.sort((a, b) => a.avgPrice - b.avgPrice);
    const cheapestMerchant = merchantAverages[0];

    // Generate recommendations
    const recommendations: string[] = [];

    // Price trend
    if (priceHistory.length >= 2) {
      const recentPrice = priceHistory[0].price;
      const oldPrice = priceHistory[priceHistory.length - 1].price;
      const priceDiff = recentPrice - oldPrice;
      const percentChange = ((priceDiff / oldPrice) * 100).toFixed(1);

      if (priceDiff > 0) {
        recommendations.push(
          `Price increased by ${percentChange}% (from ₺${oldPrice.toFixed(2)} to ₺${recentPrice.toFixed(2)})`
        );
      } else if (priceDiff < 0) {
        recommendations.push(
          `Price decreased by ${Math.abs(parseFloat(percentChange))}% (from ₺${oldPrice.toFixed(2)} to ₺${recentPrice.toFixed(2)})`
        );
      } else {
        recommendations.push(`Price has remained stable at ₺${recentPrice.toFixed(2)}`);
      }
    }

    // Average price comparison
    recommendations.push(`Average price: ₺${averagePrice.toFixed(2)}`);

    // Cheapest merchant
    if (cheapestMerchant) {
      recommendations.push(
        `Cheapest at ${cheapestMerchant.merchant} (avg: ₺${cheapestMerchant.avgPrice.toFixed(2)}, ${cheapestMerchant.count} purchase${cheapestMerchant.count > 1 ? 's' : ''})`
      );
    }

    // Price range insight
    const priceRange = maxPrice - minPrice;
    if (priceRange > 0) {
      const percentRange = ((priceRange / minPrice) * 100).toFixed(0);
      recommendations.push(
        `Price varies by ${percentRange}% across merchants (₺${minPrice.toFixed(2)} - ₺${maxPrice.toFixed(2)})`
      );
    }

    return new Response(
      JSON.stringify({
        productName,
        averagePrice,
        minPrice,
        maxPrice,
        priceHistory,
        recommendations,
        cheapestMerchant: {
          name: cheapestMerchant?.merchant,
          price: cheapestMerchant?.avgPrice,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
