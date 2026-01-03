# moneyCheck Supabase Backend

This folder contains the Supabase configuration and database migrations for the moneyCheck app.

## 📋 Prerequisites

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Create a Supabase account:**
   - Go to https://supabase.com
   - Click "Start your project"
   - Create a new organization and project

## 🚀 Setup Instructions

### Step 1: Initialize Supabase Locally

```bash
# From the project root
cd supabase

# Login to Supabase CLI
supabase login

# Link to your Supabase project
supabase link --project-ref your-project-ref
```

**Where to find your project-ref:**
- Go to your Supabase dashboard
- Click on "Settings" → "General"
- Copy the "Reference ID"

### Step 2: Run Migrations

```bash
# Push the schema to your Supabase project
supabase db push

# Or run migrations locally for testing
supabase db reset
```

### Step 3: Get Your API Keys

After setting up, you'll need these for the mobile app:

1. **Go to:** Supabase Dashboard → Settings → API
2. **Copy:**
   - `Project URL` (e.g., https://xxxxx.supabase.co)
   - `anon public` key

3. **Add to your mobile app:**
   ```bash
   cd ../moneyCheck
   
   # Create .env file
   echo "EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co" >> .env
   echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> .env
   ```

## 📊 Database Schema

### Tables

1. **`receipts`** - Receipt header information
   - user_id, merchant_name, purchase_date, total_amount
   - image_url (points to Supabase Storage)

2. **`line_items`** - Individual products from receipts
   - receipt_id, product_name, quantity, unit_price, total_price

3. **`price_insights`** - Aggregated price data (computed daily)
   - product_name, merchant_name, avg_price, min_price, max_price

### Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only see/edit their own receipts
- Price insights are read-only for all authenticated users

## 🔄 Updating Price Insights

Price insights are calculated from user receipts. To refresh them:

**Option A: Manual Refresh (for testing)**
```sql
SELECT refresh_price_insights();
```

**Option B: Scheduled Refresh (production)**
Set up a cron job in Supabase Dashboard:
1. Go to Database → Cron Jobs
2. Add new job:
   - Name: "Refresh Price Insights"
   - Schedule: `0 2 * * *` (daily at 2 AM)
   - SQL: `SELECT refresh_price_insights();`

## 🧪 Testing the Database

### Test with SQL Editor

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Insert a test receipt (replace 'YOUR_USER_ID' with a real auth.users.id)
INSERT INTO receipts (user_id, merchant_name, purchase_date, total_amount)
VALUES ('YOUR_USER_ID', 'Migros', '2025-01-03', 125.50);

-- Insert test line items
INSERT INTO line_items (receipt_id, user_id, product_name, quantity, unit_price, total_price)
VALUES 
  ((SELECT id FROM receipts LIMIT 1), 'YOUR_USER_ID', 'Sütaş Süt 1L', 2, 42.50, 85.00),
  ((SELECT id FROM receipts LIMIT 1), 'YOUR_USER_ID', 'Ekmek', 1, 10.00, 10.00);

-- Calculate price insights
SELECT refresh_price_insights();

-- View price insights
SELECT * FROM price_insights;
```

## 📁 Storage Setup (Receipt Images)

1. **Go to:** Supabase Dashboard → Storage
2. **Create a bucket:** `receipt-images`
3. **Set bucket to:** Public (so users can view their receipt images)
4. **Set policies:**
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Users can upload own images"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'receipt-images' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Allow users to view their own images
   CREATE POLICY "Users can view own images"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'receipt-images' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## 🔧 Useful Commands

```bash
# Check migration status
supabase db status

# Generate TypeScript types (for mobile app)
supabase gen types typescript --linked > ../moneyCheck/lib/types/supabase.ts

# View local database logs
supabase db logs

# Reset local database (warning: deletes all data)
supabase db reset

# Push local migrations to remote
supabase db push

# Pull remote changes to local
supabase db pull
```

## 📖 Next Steps

After setting up Supabase:

1. ✅ Deploy Edge Functions (for price comparison)
2. ✅ Update mobile app to use Supabase client
3. ✅ Add authentication screens
4. ✅ Implement sync service

See `../docs/BACKEND_ROADMAP.md` for the full implementation plan.

## 🆘 Troubleshooting

**Problem:** "supabase: command not found"
```bash
npm install -g supabase
```

**Problem:** "Permission denied" when pushing migrations
```bash
supabase login
supabase link --project-ref your-ref
```

**Problem:** Row Level Security blocking queries
- Make sure you're authenticated in your app
- Check that your user_id matches the auth.uid()
- Test in SQL Editor with: `SELECT auth.uid();`

## 📚 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)

