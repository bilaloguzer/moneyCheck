import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceComparisonRequest {
  productName: string;
  merchantId?: string;
  limit?: number;
}

interface PriceComparisonResponse {
  productName: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  currentPrice?: number;
  priceHistory: {
    merchant: string;
    price: number;
    date: string;
    quantity: number;
    unit: string;
  }[];
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { productName, merchantId, limit = 20 }: PriceComparisonRequest = await req.json();

    if (!productName) {
      return new Response(
        JSON.stringify({ error: 'productName is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Search for similar products using trigram similarity
    const { data: items, error } = await supabaseClient
      .from('line_items')
      .select(`
        id,
        clean_name,
        unit_price,
        quantity,
        unit,
        created_at,
        receipts (
          merchant_name,
          purchase_date
        )
      `)
      .ilike('clean_name', `%${productName}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({
          productName,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0,
          priceHistory: [],
          recommendations: ['No price data found for this product.'],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate statistics
    const prices = items.map((item) => item.unit_price);
    const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Build price history
    const priceHistory = items.map((item) => ({
      merchant: item.receipts.merchant_name,
      price: item.unit_price,
      date: item.receipts.purchase_date,
      quantity: item.quantity,
      unit: item.unit,
    }));

    // Generate recommendations
    const recommendations: string[] = [];
    const currentPrice = merchantId
      ? items.find((item) => item.receipts.merchant_name === merchantId)?.unit_price
      : undefined;

    if (currentPrice) {
      const priceDiff = ((currentPrice - averagePrice) / averagePrice) * 100;
      if (priceDiff > 20) {
        recommendations.push(`This price is ${priceDiff.toFixed(0)}% above average. Consider other merchants.`);
      } else if (priceDiff < -20) {
        recommendations.push(`Great deal! This price is ${Math.abs(priceDiff).toFixed(0)}% below average.`);
      } else {
        recommendations.push('This price is around average.');
      }
    }

    const cheapestMerchant = priceHistory.reduce((min, item) =>
      item.price < min.price ? item : min
    );
    recommendations.push(`Cheapest found at ${cheapestMerchant.merchant} for ₺${cheapestMerchant.price.toFixed(2)}.`);

    const response: PriceComparisonResponse = {
      productName,
      averagePrice: parseFloat(averagePrice.toFixed(2)),
      minPrice: parseFloat(minPrice.toFixed(2)),
      maxPrice: parseFloat(maxPrice.toFixed(2)),
      currentPrice,
      priceHistory,
      recommendations,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

