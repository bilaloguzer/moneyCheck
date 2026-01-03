# 🚀 Quick Start Guide

## ✅ What's Already Done

Your Supabase backend is **fully deployed and ready**! Here's what's been set up:

- ✅ Database schema deployed (receipts + line_items tables)
- ✅ Row-Level Security (RLS) policies active
- ✅ Price comparison Edge Function deployed
- ✅ Mobile app integrated with Supabase authentication
- ✅ All screens updated to use cloud database

## 📝 Next Steps (5 minutes)

### 1. Get Your Supabase Keys

1. Visit: https://supabase.com/dashboard/project/rtzicegldsutoeasdjcy/settings/api
2. Copy these two values:
   - **Project URL** (already set: `https://rtzicegldsutoeasdjcy.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 2. Create `.env` File

Create a file at `moneyCheck/.env` with this content:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://rtzicegldsutoeasdjcy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ... (paste your anon key here)

# OpenAI API Key (for OCR)
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Run the App

```bash
cd moneyCheck
npm start
```

### 4. Test the Flow

1. **Sign Up:** Create a new account (email + password)
2. **Scan Receipt:** Use the camera to scan a receipt
3. **Edit & Save:** Review OCR results, edit if needed, save
4. **View Data:** Check Home, History, and Analytics screens
5. **Price Comparison:** (Optional) Call the Edge Function to compare prices

## 🔐 Authentication Setup

By default, Supabase requires email confirmation. To test quickly, disable it:

1. Go to: https://supabase.com/dashboard/project/rtzicegldsutoeasdjcy/auth/users
2. Settings > Email Auth
3. **Disable** "Confirm email"

## 📊 Price Comparison API

The Edge Function is live at:
```
POST https://rtzicegldsutoeasdjcy.supabase.co/functions/v1/price-comparison
```

**Example Request:**
```json
{
  "productName": "Coca Cola",
  "merchantId": "Migros",
  "limit": 20
}
```

**Example Response:**
```json
{
  "productName": "Coca Cola",
  "averagePrice": 25.50,
  "minPrice": 22.00,
  "maxPrice": 30.00,
  "currentPrice": 25.00,
  "priceHistory": [
    { "merchant": "Migros", "price": 25.00, "date": "2025-01-03", "quantity": 1, "unit": "pcs" },
    { "merchant": "Carrefour", "price": 22.00, "date": "2025-01-02", "quantity": 1, "unit": "pcs" }
  ],
  "recommendations": [
    "This price is around average.",
    "Cheapest found at Carrefour for ₺22.00."
  ]
}
```

## 🎨 What You Can Build Next

- **Budget Tracking:** Set monthly spending limits
- **Merchant Insights:** Track which stores are cheapest
- **Product Search:** Find specific items across all receipts
- **Export to CSV:** Download spending data
- **Shopping List:** Smart suggestions based on purchase history
- **Receipt Sharing:** Share receipts with family members

## 🐛 Troubleshooting

**"Authentication Error"**
- Make sure `.env` file exists with correct keys
- Check that email confirmation is disabled in Supabase

**"Failed to save receipt"**
- Verify you're signed in
- Check RLS policies in Supabase dashboard

**"Network Error"**
- Ensure you're connected to the internet
- Verify Supabase project URL is correct

## 📚 Documentation

- **Supabase Dashboard:** https://supabase.com/dashboard/project/rtzicegldsutoeasdjcy
- **Full Setup Details:** See `SUPABASE_SETUP_COMPLETE.md`
- **Database Schema:** See `supabase/migrations/20250103000000_initial_schema.sql`

---

**Your app is production-ready!** 🎉 Just add the environment keys and start testing.

