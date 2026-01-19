-- SmartSpend Category System - SQLite Migration Script
-- Generated for React Native + Expo SQLite

-- Drop existing tables if they exist
DROP TABLE IF EXISTS item_groups;
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS departments;

-- Create Departments table
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color_code TEXT NOT NULL,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  department_id INTEGER NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Create Subcategories table
CREATE TABLE subcategories (
  id INTEGER PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create Item Groups table
CREATE TABLE item_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subcategory_id INTEGER NOT NULL,
  name_tr TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_categories_department ON categories(department_id);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);
CREATE INDEX idx_item_groups_subcategory ON item_groups(subcategory_id);

-- Insert Departments
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (1, 'Gıda ve İçecek (Food & Beverage)', 'Food & Beverage', '#2E7D32', '🍎');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (2, 'Ev ve Temizlik', 'Household & Cleaning', '#0288D1', '🧹');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (3, 'Kişisel Bakım ve Kozmetik', 'Personal Care & Beauty', '#AB47BC', '💄');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (4, 'Sağlık ve Eczane', 'Health & Pharmacy', '#E91E63', '💊');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (5, 'Elektronik ve Teknoloji', 'Electronics & Technology', '#2196F3', '📱');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (6, 'Giyim ve Moda', 'Clothing & Fashion', '#FF6F61', '👕');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (7, 'Ev ve Yaşam', 'Home & Living', '#795548', '🏠');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (8, 'Ulaşım ve Yakıt', 'Transportation & Fuel', '#FF5722', '🚗');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (9, 'Eğlence ve Medya', 'Entertainment & Media', '#9C27B0', '🎮');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (10, 'Spor ve Outdoor', 'Sports & Outdoors', '#009688', '⚽');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (11, 'Eğitim ve Kırtasiye', 'Education & Stationery', '#3F51B5', '📚');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (12, 'Hizmetler', 'Services', '#607D8B', '🛠️');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (13, 'Evcil Hayvanlar', 'Pets', '#8BC34A', '🐾');
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (14, 'Diğer', 'Miscellaneous', '#FFC107', '📦');

-- Insert Categories
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (101, 1, 'Meyve ve Sebze', 'Fruits & Vegetables', '#4CAF50');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (102, 1, 'Süt Ürünleri', 'Dairy Products', '#8BC34A');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (103, 1, 'Et ve Balık', 'Meat & Seafood', '#1B5E20');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (104, 1, 'Fırın ve Ekmek', 'Bakery & Bread', '#CDC092');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (105, 1, 'Temel Gıda', 'Pantry Staples', '#7CB342');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (106, 1, 'Atıştırmalık', 'Snacks', '#00C853');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (107, 1, 'İçecekler', 'Beverages', '#66BB6A');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (108, 1, 'Dondurulmuş Gıda', 'Frozen Foods', '#69F0AE');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (109, 1, 'Kahvaltılık', 'Breakfast Items', '#558B2F');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (201, 2, 'Çamaşır', 'Laundry', '#03A9F4');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (202, 2, 'Mutfak Temizliği', 'Kitchen Cleaning', '#0277BD');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (203, 2, 'Banyo Temizliği', 'Bathroom Cleaning', '#01579B');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (204, 2, 'Genel Temizlik', 'General Cleaning', '#0097A7');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (205, 2, 'Kağıt Ürünler', 'Paper Products', '#006064');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (301, 3, 'Hijyen', 'Hygiene', '#BA68C8');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (302, 3, 'Saç Bakımı', 'Hair Care', '#9C27B0');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (303, 3, 'Cilt Bakımı', 'Skin Care', '#8E24AA');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (304, 3, 'Makyaj', 'Makeup', '#6A1B9A');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (305, 3, 'Tıraş', 'Shaving', '#4A148C');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (306, 3, 'Kadın Hijyen', 'Feminine Hygiene', '#D500F9');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (401, 4, 'İlaç ve Vitamin', 'Medicine & Vitamins', '#EC407A');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (402, 4, 'İlk Yardım', 'First Aid', '#C2185B');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (403, 4, 'Bebek ve Anne Sağlığı', 'Mother & Baby Health', '#880E4F');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (404, 4, 'Medikal Cihaz', 'Medical Devices', '#AD1457');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (501, 5, 'Telefon ve Tablet', 'Phones & Tablets', '#42A5F5');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (502, 5, 'Bilgisayar', 'Computers', '#1976D2');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (503, 5, 'Ses ve Görüntü', 'Audio & Video', '#0D47A1');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (504, 5, 'Fotoğraf ve Kamera', 'Photography & Camera', '#01579B');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (505, 5, 'Oyun Konsolu', 'Gaming Consoles', '#0091EA');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (601, 6, 'Kadın Giyim', 'Women''s Clothing', '#FF8A80');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (602, 6, 'Erkek Giyim', 'Men''s Clothing', '#FF5252');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (603, 6, 'Çocuk Giyim', 'Kids'' Clothing', '#F44336');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (604, 6, 'Ayakkabı', 'Shoes', '#D32F2F');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (605, 6, 'Aksesuar', 'Accessories', '#C62828');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (606, 6, 'İç Giyim', 'Underwear', '#B71C1C');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (701, 7, 'Mobilya', 'Furniture', '#8D6E63');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (702, 7, 'Ev Tekstili', 'Home Textiles', '#6D4C41');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (703, 7, 'Mutfak Eşyası', 'Kitchenware', '#5D4037');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (704, 7, 'Ev Aletleri', 'Home Appliances', '#4E342E');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (705, 7, 'Dekorasyon', 'Decoration', '#3E2723');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (801, 8, 'Yakıt', 'Fuel', '#FF6F43');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (802, 8, 'Toplu Taşıma', 'Public Transport', '#F4511E');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (803, 8, 'Otopark ve Geçiş', 'Parking & Tolls', '#E64A19');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (804, 8, 'Araç Bakım', 'Vehicle Maintenance', '#D84315');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (901, 9, 'Dijital İçerik', 'Digital Content', '#AB47BC');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (902, 9, 'Kitap ve Dergi', 'Books & Magazines', '#8E24AA');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (903, 9, 'Sinema ve Tiyatro', 'Cinema & Theater', '#7B1FA2');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (904, 9, 'Hobi', 'Hobbies', '#6A1B9A');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1001, 10, 'Spor Giyim', 'Sportswear', '#26A69A');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1002, 10, 'Spor Ekipmanı', 'Sports Equipment', '#00897B');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1003, 10, 'Spor Salonları', 'Gyms', '#00796B');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1101, 11, 'Kırtasiye', 'Stationery', '#5C6BC0');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1102, 11, 'Okul Malzemeleri', 'School Supplies', '#303F9F');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1103, 11, 'Eğitim Hizmetleri', 'Educational Services', '#283593');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1201, 12, 'Faturalar', 'Utilities', '#78909C');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1202, 12, 'Profesyonel Hizmetler', 'Professional Services', '#546E7A');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1203, 12, 'Ev Hizmetleri', 'Home Services', '#455A64');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1204, 12, 'Güzellik ve Bakım', 'Beauty & Care', '#37474F');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1301, 13, 'Kedi', 'Cats', '#9CCC65');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1302, 13, 'Köpek', 'Dogs', '#7CB342');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1303, 13, 'Kuş ve Diğer', 'Birds & Others', '#689F38');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1304, 13, 'Veteriner', 'Veterinary', '#558B2F');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1401, 14, 'Bağış ve Yardım', 'Donations & Charity', '#FFD54F');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1402, 14, 'Hediye', 'Gifts', '#FFB300');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1403, 14, 'Sigara ve Tütün', 'Tobacco', '#FFA000');
INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES
  (1404, 14, 'Sınıflandırılamayan', 'Uncategorized', '#FF8F00');

-- Insert Subcategories
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10101, 101, 'Taze Meyveler', 'Fresh Fruits', '#66BB6A');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10102, 101, 'Taze Sebzeler', 'Fresh Vegetables', '#81C784');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10103, 101, 'Salata ve Yaprak', 'Salad & Greens', '#A5D6A7');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10201, 102, 'Süt', 'Milk', '#9CCC65');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10202, 102, 'Peynir', 'Cheese', '#AED581');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10203, 102, 'Yoğurt', 'Yogurt', '#C5E1A5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10204, 102, 'Tereyağı ve Krema', 'Butter & Cream', '#DCEDC8');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10205, 102, 'Yumurta', 'Eggs', '#E8F5E9');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10301, 103, 'Tavuk ve Kanatlı', 'Poultry', '#2E7D32');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10302, 103, 'Kırmızı Et', 'Red Meat', '#388E3C');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10303, 103, 'Balık ve Deniz Ürünleri', 'Fish & Seafood', '#43A047');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10304, 103, 'Şarküteri', 'Deli Meats', '#4CAF50');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10401, 104, 'Ekmek', 'Bread', '#D4C9A1');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10402, 104, 'Simit ve Poğaça', 'Simit & Pastries', '#DDD2B0');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10403, 104, 'Pasta ve Tatlı', 'Cakes & Desserts', '#E6DBBF');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10501, 105, 'Un ve Tahıl', 'Flour & Grains', '#8BC34A');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10502, 105, 'Makarna', 'Pasta', '#9CCC65');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10503, 105, 'Baklagiller', 'Legumes', '#AED581');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10504, 105, 'Konserve', 'Canned Goods', '#C5E1A5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10505, 105, 'Yağlar', 'Oils & Fats', '#DCEDC8');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10506, 105, 'Baharatlar', 'Spices', '#E8F5E9');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10601, 106, 'Cips ve Krakerler', 'Chips & Crackers', '#00E676');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10602, 106, 'Kuruyemiş', 'Nuts & Dried Fruits', '#1DE9B6');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10603, 106, 'Çikolata ve Şeker', 'Chocolate & Candy', '#64FFDA');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10701, 107, 'Su', 'Water', '#81C784');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10702, 107, 'Meşrubat', 'Soft Drinks', '#A5D6A7');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10703, 107, 'Meyve Suyu', 'Juice', '#C8E6C9');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10704, 107, 'Kahve ve Çay', 'Coffee & Tea', '#E8F5E9');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10801, 108, 'Dondurulmuş Sebze', 'Frozen Vegetables', '#B9F6CA');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10802, 108, 'Dondurulmuş Et', 'Frozen Meat', '#CCFCD6');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10803, 108, 'Hazır Yemek', 'Ready Meals', '#E0FFE8');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10804, 108, 'Dondurma', 'Ice Cream', '#F1FFF5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10901, 109, 'Reçel ve Bal', 'Jams & Honey', '#689F38');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10902, 109, 'Çikolata ve Sürme', 'Spreads', '#7CB342');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10903, 109, 'Tahıl ve Mısır Gevreği', 'Cereals', '#8BC34A');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (10904, 109, 'Zeytin ve Turşu', 'Olives & Pickles', '#9CCC65');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20101, 201, 'Deterjan', 'Detergent', '#29B6F6');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20102, 201, 'Yumuşatıcı', 'Fabric Softener', '#4FC3F7');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20201, 202, 'Bulaşık', 'Dishwashing', '#0288D1');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20202, 202, 'Sünger ve Bez', 'Sponges & Cloths', '#039BE5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20203, 202, 'Çöp Poşeti', 'Trash Bags', '#03A9F4');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20301, 203, 'Klozet ve Banyo', 'Toilet & Bathroom', '#0277BD');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20302, 203, 'Dezenfektan', 'Disinfectant', '#0288D1');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20401, 204, 'Zemin Temizliği', 'Floor Cleaning', '#00ACC1');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20402, 204, 'Cam Temizliği', 'Glass Cleaning', '#00BCD4');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20501, 205, 'Tuvalet Kağıdı', 'Toilet Paper', '#00838F');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (20502, 205, 'Havlu ve Peçete', 'Towels & Napkins', '#0097A7');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30101, 301, 'Sabun', 'Soap', '#CE93D8');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30102, 301, 'Duş', 'Shower', '#E1BEE7');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30103, 301, 'Ağız Bakımı', 'Oral Care', '#F3E5F5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30104, 301, 'Deodorant', 'Deodorant', '#EDE7F6');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30201, 302, 'Şampuan ve Saç Kremi', 'Shampoo & Conditioner', '#AB47BC');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30202, 302, 'Saç Şekillendirme', 'Hair Styling', '#BA68C8');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30301, 303, 'Yüz Bakımı', 'Face Care', '#9C27B0');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30302, 303, 'Vücut Bakımı', 'Body Care', '#AB47BC');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30401, 304, 'Yüz Makyajı', 'Face Makeup', '#7B1FA2');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30402, 304, 'Göz Makyajı', 'Eye Makeup', '#8E24AA');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30403, 304, 'Dudak Makyajı', 'Lip Makeup', '#9C27B0');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30501, 305, 'Erkek Tıraş', 'Men''s Shaving', '#6A1B9A');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30502, 305, 'Kadın Epilasyon', 'Women''s Hair Removal', '#7B1FA2');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (30601, 306, 'Ped ve Tampon', 'Pads & Tampons', '#E040FB');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (40101, 401, 'Ağrı Kesici', 'Pain Relief', '#F06292');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (40102, 401, 'Vitamin ve Takviye', 'Vitamins & Supplements', '#F48FB1');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (40103, 401, 'Soğuk Algınlığı', 'Cold & Flu', '#F8BBD0');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (40201, 402, 'Pansuman', 'Wound Care', '#D81B60');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (40202, 402, 'Termometre ve Ölçüm', 'Thermometer & Measurement', '#E91E63');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (40301, 403, 'Bebek Bakımı', 'Baby Care', '#AD1457');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (40302, 403, 'Bebek Maması', 'Baby Formula', '#C2185B');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (40401, 404, 'Tansiyon ve Ateş', 'BP & Temperature', '#C2185B');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50101, 501, 'Akıllı Telefon', 'Smartphones', '#64B5F6');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50102, 501, 'Tablet', 'Tablets', '#90CAF9');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50103, 501, 'Aksesuarlar', 'Accessories', '#BBDEFB');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50201, 502, 'Dizüstü Bilgisayar', 'Laptops', '#1E88E5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50202, 502, 'Masaüstü', 'Desktops', '#2196F3');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50203, 502, 'Çevre Birimleri', 'Peripherals', '#42A5F5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50301, 503, 'Kulaklık', 'Headphones', '#1565C0');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50302, 503, 'Hoparlör', 'Speakers', '#1976D2');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50303, 503, 'TV', 'Television', '#1E88E5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50401, 504, 'Kamera', 'Cameras', '#0277BD');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50402, 504, 'Objektif ve Aksesuar', 'Lens & Accessories', '#0288D1');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50501, 505, 'Konsollar', 'Consoles', '#00B0FF');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (50502, 505, 'Oyun ve Aksesuar', 'Games & Accessories', '#40C4FF');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60101, 601, 'Üst Giyim', 'Tops', '#FF9E80');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60102, 601, 'Alt Giyim', 'Bottoms', '#FFB199');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60103, 601, 'Elbise', 'Dresses', '#FFC5B3');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60104, 601, 'Dış Giyim', 'Outerwear', '#FFD8CC');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60201, 602, 'Üst Giyim', 'Tops', '#FF6E6E');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60202, 602, 'Alt Giyim', 'Bottoms', '#FF8A8A');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60203, 602, 'Dış Giyim', 'Outerwear', '#FFA6A6');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60301, 603, 'Bebek Giyim', 'Baby Clothing', '#E57373');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60302, 603, 'Çocuk Üst', 'Kids'' Tops', '#EF5350');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60303, 603, 'Çocuk Alt', 'Kids'' Bottoms', '#F44336');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60401, 604, 'Spor Ayakkabı', 'Sneakers', '#E53935');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60402, 604, 'Klasik Ayakkabı', 'Dress Shoes', '#F44336');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60403, 604, 'Sandalet ve Terlik', 'Sandals & Slippers', '#EF5350');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60501, 605, 'Çanta', 'Bags', '#D32F2F');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60502, 605, 'Takı', 'Jewelry', '#E53935');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60503, 605, 'Diğer Aksesuarlar', 'Other Accessories', '#F44336');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60601, 606, 'Kadın İç Giyim', 'Women''s Underwear', '#C62828');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (60602, 606, 'Erkek İç Giyim', 'Men''s Underwear', '#D32F2F');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70101, 701, 'Oturma Odası', 'Living Room', '#A1887F');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70102, 701, 'Yatak Odası', 'Bedroom', '#BCAAA4');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70103, 701, 'Mutfak', 'Kitchen', '#D7CCC8');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70201, 702, 'Yatak Tekstili', 'Bedding', '#795548');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70202, 702, 'Havlu', 'Towels', '#8D6E63');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70203, 702, 'Perde', 'Curtains', '#A1887F');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70301, 703, 'Tencere ve Tava', 'Pots & Pans', '#6D4C41');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70302, 703, 'Sofra', 'Tableware', '#795548');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70303, 703, 'Mutfak Gereçleri', 'Kitchen Tools', '#8D6E63');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70304, 703, 'Saklama Kabı', 'Storage Containers', '#A1887F');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70401, 704, 'Beyaz Eşya', 'Major Appliances', '#5D4037');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70402, 704, 'Küçük Ev Aletleri', 'Small Appliances', '#6D4C41');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70501, 705, 'Aydınlatma', 'Lighting', '#4E342E');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (70502, 705, 'Dekor Ürünler', 'Decor Items', '#5D4037');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (80101, 801, 'Motorlu Yakıt', 'Vehicle Fuel', '#FF8A65');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (80201, 802, 'Kartlar ve Biletler', 'Cards & Tickets', '#FF5722');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (80301, 803, 'Otopark', 'Parking', '#FF5722');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (80302, 803, 'Köprü ve Otoyol', 'Bridge & Highway', '#FF6F43');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (80401, 804, 'Servis ve Tamir', 'Service & Repair', '#E64A19');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (80402, 804, 'Yıkama', 'Car Wash', '#F4511E');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (90101, 901, 'Streaming', 'Streaming Services', '#BA68C8');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (90102, 901, 'Oyun', 'Gaming', '#CE93D8');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (90201, 902, 'Kitap', 'Books', '#9C27B0');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (90202, 902, 'Dergi ve Gazete', 'Magazines & Newspapers', '#AB47BC');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (90301, 903, 'Biletler', 'Tickets', '#8E24AA');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (90401, 904, 'Sanat Malzemeleri', 'Art Supplies', '#7B1FA2');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (90402, 904, 'Müzik Aletleri', 'Musical Instruments', '#8E24AA');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (100101, 1001, 'Kıyafetler', 'Clothing', '#4DB6AC');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (100102, 1001, 'Ayakkabı', 'Footwear', '#80CBC4');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (100201, 1002, 'Fitness', 'Fitness', '#009688');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (100202, 1002, 'Takım Sporları', 'Team Sports', '#26A69A');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (100203, 1002, 'Outdoor', 'Outdoor', '#4DB6AC');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (100301, 1003, 'Üyelik', 'Membership', '#00897B');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (110101, 1101, 'Yazı Gereçleri', 'Writing Supplies', '#7986CB');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (110102, 1101, 'Defter ve Ajanda', 'Notebooks & Planners', '#9FA8DA');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (110103, 1101, 'Dosyalama', 'Filing', '#C5CAE9');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (110201, 1102, 'Çanta', 'Bags', '#3949AB');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (110202, 1102, 'Sanat Malzemeleri', 'Art Supplies', '#3F51B5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (110301, 1103, 'Kurslar', 'Courses', '#303F9F');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (120101, 1201, 'Elektrik ve Doğalgaz', 'Electricity & Gas', '#90A4AE');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (120102, 1201, 'Su', 'Water', '#B0BEC5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (120103, 1201, 'İletişim', 'Communication', '#CFD8DC');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (120201, 1202, 'Hukuki', 'Legal', '#607D8B');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (120202, 1202, 'Mali', 'Financial', '#78909C');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (120301, 1203, 'Tamir ve Tadilat', 'Repair & Renovation', '#546E7A');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (120302, 1203, 'Temizlik', 'Cleaning', '#607D8B');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (120401, 1204, 'Kuaför', 'Hairdresser', '#455A64');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (120402, 1204, 'Estetik', 'Aesthetics', '#546E7A');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (130101, 1301, 'Mama', 'Food', '#AED581');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (130102, 1301, 'Kum ve Hijyen', 'Litter & Hygiene', '#C5E1A5');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (130103, 1301, 'Aksesuarlar', 'Accessories', '#DCEDC8');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (130201, 1302, 'Mama', 'Food', '#8BC34A');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (130202, 1302, 'Aksesuar', 'Accessories', '#9CCC65');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (130203, 1302, 'Hijyen', 'Hygiene', '#AED581');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (130301, 1303, 'Kuş', 'Birds', '#7CB342');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (130302, 1303, 'Akvaryum', 'Aquarium', '#8BC34A');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (130401, 1304, 'Sağlık', 'Health', '#689F38');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (140101, 1401, 'Bağışlar', 'Donations', '#FFE082');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (140201, 1402, 'Hediye Ürünler', 'Gift Items', '#FFC107');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (140301, 1403, 'Sigara', 'Cigarettes', '#FFB300');
INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES
  (140401, 1404, 'Diğer Alışverişler', 'Other Purchases', '#FFA000');

-- Insert Item Groups
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10101, 'Elma');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10101, 'Portakal');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10101, 'Muz');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10101, 'Çilek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10101, 'Üzüm');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10101, 'Kavun');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10101, 'Karpuz');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10101, 'Şeftali');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10101, 'Kiraz');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10101, 'Nar');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10102, 'Domates');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10102, 'Salatalık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10102, 'Biber');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10102, 'Patlıcan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10102, 'Kabak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10102, 'Havuç');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10102, 'Soğan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10102, 'Sarımsak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10102, 'Patates');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10102, 'Yeşillik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10103, 'Marul');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10103, 'Roka');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10103, 'Maydanoz');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10103, 'Dereotu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10103, 'Nane');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10103, 'Fesleğen');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10103, 'Ispanak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10103, 'Taze Soğan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10201, 'Tam Yağlı Süt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10201, 'Az Yağlı Süt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10201, 'Yağsız Süt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10201, 'Laktozsuz Süt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10201, 'UHT Süt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10201, 'Günlük Süt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10202, 'Beyaz Peynir');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10202, 'Kaşar');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10202, 'Tulum');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10202, 'Lor');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10202, 'Krem Peynir');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10202, 'Çökelek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10202, 'Gravyer');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10202, 'Ezine');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10203, 'Süzme Yoğurt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10203, 'Tam Yağlı Yoğurt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10203, 'Light Yoğurt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10203, 'Ayran');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10203, 'Kefir');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10203, 'Meyveli Yoğurt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10204, 'Tereyağı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10204, 'Margarin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10204, 'Krema');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10204, 'Kaymak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10204, 'Labne');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10205, 'Tavuk Yumurtası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10205, 'Köy Yumurtası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10205, 'Organik Yumurta');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10301, 'Tavuk Göğsü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10301, 'Tavuk Butu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10301, 'Tavuk Kanat');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10301, 'Bütün Tavuk');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10301, 'Hindi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10301, 'Tavuk Pirzola');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10302, 'Dana Eti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10302, 'Kuzu Eti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10302, 'Kıyma');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10302, 'Biftek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10302, 'Kuşbaşı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10302, 'Kemikli Et');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10302, 'Kavurmalık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10303, 'Hamsi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10303, 'Çupra');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10303, 'Levrek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10303, 'Palamut');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10303, 'Mezgit');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10303, 'İstavrit');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10303, 'Karides');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10303, 'Midye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10303, 'Ahtapot');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10304, 'Salam');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10304, 'Sucuk');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10304, 'Sosis');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10304, 'Jambon');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10304, 'Pastırma');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10304, 'Dilimlenmiş Et');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10304, 'Kavurma');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10304, 'Kangal Sucuk');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10401, 'Beyaz Ekmek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10401, 'Tam Buğday');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10401, 'Çavdar Ekmeği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10401, 'Kepekli');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10401, 'Bazlama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10401, 'Somun');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10401, 'Sandviç Ekmeği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10402, 'Simit');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10402, 'Açma');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10402, 'Poğaça');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10402, 'Çörek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10402, 'Ay Çöreği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10402, 'Tuzlu Kurabiye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10403, 'Kek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10403, 'Pasta');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10403, 'Kurabiye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10403, 'Waffle');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10403, 'Kruvasan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10403, 'Donut');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10403, 'Muffin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10501, 'Beyaz Un');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10501, 'Tam Buğday Unu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10501, 'Mısır Unu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10501, 'Pirinç');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10501, 'Bulgur');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10501, 'Yulaf');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10501, 'Kinoa');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10501, 'Kuskus');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10502, 'Spagetti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10502, 'Fiyonk');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10502, 'Burgu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10502, 'Penne');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10502, 'Erişte');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10502, 'Şehriye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10502, 'Arpa Şehriye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10503, 'Nohut');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10503, 'Kuru Fasulye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10503, 'Kırmızı Mercimek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10503, 'Yeşil Mercimek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10503, 'Barbunya');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10503, 'Börülce');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10504, 'Konserve Domates');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10504, 'Konserve Fasulye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10504, 'Mısır');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10504, 'Bezelye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10504, 'Ton Balığı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10504, 'Biber Salçası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10504, 'Domates Salçası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10505, 'Zeytinyağı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10505, 'Ayçiçek Yağı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10505, 'Mısırözü Yağı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10505, 'Tereyağı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10505, 'Margarin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10506, 'Karabiber');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10506, 'Pul Biber');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10506, 'Kimyon');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10506, 'Kekik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10506, 'Nane');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10506, 'Tarçın');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10506, 'Zencefil');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10506, 'Karanfil');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10601, 'Patates Cipsi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10601, 'Mısır Cipsi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10601, 'Kraker');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10601, 'Grissini');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10601, 'Galeta');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10601, 'Gevrek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10602, 'Fındık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10602, 'Fıstık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10602, 'Badem');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10602, 'Ceviz');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10602, 'Ay Çekirdeği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10602, 'Kabak Çekirdeği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10602, 'Kuru Üzüm');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10602, 'Kuru Kayısı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10603, 'Çikolata');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10603, 'Gofret');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10603, 'Bar');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10603, 'Şekerleme');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10603, 'Sakız');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10603, 'Lokum');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10603, 'Helva');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10701, 'Doğal Su');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10701, 'Maden Suyu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10701, 'Soda');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10702, 'Kola');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10702, 'Gazoz');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10702, 'Limonata');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10702, 'Enerji İçeceği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10702, 'Soğuk Çay');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10702, 'Ayran');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10703, 'Portakal Suyu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10703, 'Elma Suyu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10703, 'Vişne Suyu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10703, 'Şeftali Suyu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10703, 'Multivitamin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10703, 'Konsantre');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10704, 'Türk Kahvesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10704, 'Filtre Kahve');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10704, 'Neskafe');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10704, 'Çay');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10704, 'Bitki Çayı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10704, 'Yeşil Çay');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10704, 'Meyve Çayı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10801, 'Karışık Sebze');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10801, 'Fasulye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10801, 'Bezelye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10801, 'Mısır');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10801, 'Ispanak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10801, 'Patates');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10802, 'Köfte');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10802, 'Nugget');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10802, 'Balık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10802, 'Karides');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10802, 'Et Ürünleri');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10803, 'Pizza');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10803, 'Börek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10803, 'Lahmacun');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10803, 'Mantı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10803, 'Hamur İşleri');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10804, 'Kapaklı Dondurma');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10804, 'Külah');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10804, 'Çubuklu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10804, 'Aile Boy');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10901, 'Çilek Reçeli');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10901, 'Kayısı Reçeli');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10901, 'Vişne Reçeli');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10901, 'Portakal Marmelatı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10901, 'Süzme Bal');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10901, 'Pekmez');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10902, 'Çikolatalı Fındık Kreması');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10902, 'Fıstık Ezmesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10902, 'Tahin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10902, 'Tahin Pekmez');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10903, 'Mısır Gevreği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10903, 'Müsli');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10903, 'Granola');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10903, 'Yulaf Ezmesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10904, 'Siyah Zeytin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10904, 'Yeşil Zeytin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10904, 'Kırma Zeytin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10904, 'Karışık Turşu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10904, 'Salatalık Turşu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (10904, 'Biber Turşu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20101, 'Toz Deterjan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20101, 'Sıvı Deterjan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20101, 'Kapsül Deterjan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20101, 'Çamaşır Suyu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20101, 'Leke Çıkarıcı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20102, 'Yumuşatıcı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20102, 'Kokulandırıcı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20102, 'Çamaşır Parfümü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20201, 'Bulaşık Deterjanı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20201, 'Bulaşık Makinesi Tableti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20201, 'Bulaşık Makinesi Tuzu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20201, 'Parlatıcı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20202, 'Bulaşık Süngeri');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20202, 'Mikrofiber Bez');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20202, 'Temizlik Bezi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20202, 'Ovma Teli');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20203, 'Mutfak Çöp Poşeti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20203, 'Büyük Çöp Poşeti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20203, 'Kokulu Poşet');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20203, 'Battal Boy');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20301, 'Klozet Temizleyici');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20301, 'Kireç Çözücü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20301, 'Banyo Spreyi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20301, 'Duş Kabini Temizleyici');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20302, 'Çamaşır Suyu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20302, 'Dezenfektan Sprey');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20302, 'Yüzey Temizleyici');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20401, 'Yüzey Temizleyici');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20401, 'Parke Temizleyici');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20401, 'Paspas');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20401, 'Süpürge');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20401, 'Elektrik Süpürgesi Torbası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20402, 'Cam Temizleyici');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20402, 'Cam Bezi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20402, 'Silecek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20501, '3 Katlı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20501, 'Jumbo');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20501, 'Islak Tuvalet Kağıdı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20502, 'Kağıt Havlu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20502, 'Peçete');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20502, 'Cep Mendili');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (20502, 'Kutu Mendil');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30101, 'Sıvı Sabun');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30101, 'Katı Sabun');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30101, 'Antibakteriyel Sabun');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30101, 'El Dezenfektanı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30102, 'Duş Jeli');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30102, 'Şampuan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30102, 'Saç Kremi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30102, 'Banyo Köpüğü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30103, 'Diş Macunu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30103, 'Diş Fırçası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30103, 'Ağız Gargarası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30103, 'Diş İpi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30104, 'Sprey Deodorant');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30104, 'Roll-on');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30104, 'Stick Deodorant');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30104, 'Parfüm');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30201, 'Şampuan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30201, 'Saç Kremi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30201, 'Saç Maskesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30201, 'Kepek Şampuanı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30202, 'Jöle');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30202, 'Sprey');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30202, 'Köpük');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30202, 'Saç Kremi (Leave-in)');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30202, 'Saç Boyası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30301, 'Yüz Temizleyici');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30301, 'Tonik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30301, 'Nemlendirici');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30301, 'Maske');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30301, 'Serum');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30301, 'Göz Kremi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30302, 'Vücut Losyonu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30302, 'El Kremi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30302, 'Güneş Kremi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30302, 'Peeling');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30401, 'Fondöten');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30401, 'Pudra');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30401, 'Allık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30401, 'Highlighter');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30401, 'Kapatıcı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30402, 'Maskara');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30402, 'Eyeliner');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30402, 'Kaş Kalemi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30402, 'Far');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30403, 'Ruj');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30403, 'Dudak Parlatıcı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30403, 'Dudak Kalemi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30403, 'Dudak Balsamı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30501, 'Tıraş Makinesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30501, 'Tıraş Bıçağı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30501, 'Tıraş Köpüğü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30501, 'Tıraş Kremi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30501, 'Traş Sonrası Losyon');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30502, 'Jilet');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30502, 'Epilasyon Kremi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30502, 'Ağda');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30502, 'Epilatör Yedek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30601, 'Gündüz Pedi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30601, 'Gece Pedi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30601, 'Günlük Ped');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (30601, 'Tampon');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40101, 'Parasetamol');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40101, 'İbuprofen');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40101, 'Aspirin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40101, 'Ağrı Kesici Krem');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40102, 'Multivitamin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40102, 'Vitamin C');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40102, 'Vitamin D');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40102, 'Omega 3');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40102, 'Probiyotik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40102, 'Kalsiyum');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40103, 'Nezle İlacı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40103, 'Öksürük Şurubu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40103, 'Boğaz Spreyi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40103, 'Pastil');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40201, 'Yara Bandı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40201, 'Gazlı Bez');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40201, 'Pamuk');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40201, 'Antiseptik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40201, 'Sargı Bezi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40202, 'Termometre');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40202, 'Tansiyon Aleti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40202, 'Kan Şekeri Ölçer');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40301, 'Bebek Bezi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40301, 'Islak Mendil');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40301, 'Bebek Şampuanı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40301, 'Bebek Losyonu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40301, 'Pişik Kremi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40302, 'Devam Sütü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40302, 'Kaşık Maması');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40302, 'Ek Gıda');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40401, 'Tansiyon Aleti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40401, 'Ateş Ölçer');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (40401, 'Nabız Ölçer');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50101, 'iPhone');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50101, 'Samsung');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50101, 'Xiaomi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50101, 'Huawei');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50101, 'Oppo');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50101, 'Realme');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50102, 'iPad');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50102, 'Samsung Tablet');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50102, 'Android Tablet');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50103, 'Kılıf');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50103, 'Ekran Koruyucu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50103, 'Şarj Aleti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50103, 'Kablosuz Şarj');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50103, 'Kulaklık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50201, 'MacBook');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50201, 'Windows Laptop');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50201, 'Gaming Laptop');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50201, 'Chromebook');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50202, 'PC Kasası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50202, 'All-in-One');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50202, 'Gaming PC');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50203, 'Klavye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50203, 'Mouse');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50203, 'Monitör');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50203, 'Yazıcı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50203, 'Tarayıcı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50203, 'Webcam');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50203, 'Hoparlör');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50301, 'Kablosuz Kulaklık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50301, 'Kulak İçi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50301, 'Kulak Üstü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50301, 'Gaming Kulaklık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50302, 'Bluetooth Hoparlör');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50302, 'Soundbar');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50302, 'Ev Sinema Sistemi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50303, 'Smart TV');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50303, 'LED TV');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50303, 'OLED TV');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50303, 'TV Kutusu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50401, 'DSLR');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50401, 'Mirrorless');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50401, 'Kompakt Kamera');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50401, 'Action Kamera');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50402, 'Objektif');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50402, 'Tripod');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50402, 'Flaş');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50402, 'Hafıza Kartı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50402, 'Çanta');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50501, 'PlayStation');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50501, 'Xbox');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50501, 'Nintendo Switch');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50502, 'Oyun');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50502, 'Kol');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50502, 'VR Gözlük');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (50502, 'Aksesuar');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60101, 'Bluz');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60101, 'Tişört');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60101, 'Gömlek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60101, 'Kazak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60101, 'Hırka');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60101, 'Sweatshirt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60102, 'Pantolon');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60102, 'Jean');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60102, 'Etek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60102, 'Şort');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60102, 'Tayt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60103, 'Günlük Elbise');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60103, 'Gece Elbisesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60103, 'Yazlık Elbise');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60104, 'Mont');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60104, 'Kaban');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60104, 'Ceket');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60104, 'Trençkot');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60104, 'Yelek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60201, 'Tişört');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60201, 'Gömlek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60201, 'Polo');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60201, 'Kazak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60201, 'Sweatshirt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60202, 'Pantolon');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60202, 'Jean');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60202, 'Şort');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60202, 'Eşofman Altı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60203, 'Mont');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60203, 'Ceket');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60203, 'Kaban');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60203, 'Yelek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60301, 'Body');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60301, 'Tulum');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60301, 'Pijama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60301, 'Elbise');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60301, 'Takım');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60302, 'Tişört');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60302, 'Gömlek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60302, 'Kazak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60302, 'Sweatshirt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60303, 'Pantolon');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60303, 'Etek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60303, 'Şort');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60303, 'Tayt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60401, 'Koşu Ayakkabısı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60401, 'Günlük Spor');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60401, 'Basketbol Ayakkabısı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60402, 'Erkek Klasik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60402, 'Kadın Topuklu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60402, 'Babet');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60402, 'Loafer');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60403, 'Sandalet');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60403, 'Terlik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60403, 'Ev Terliği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60403, 'Plaj Terliği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60501, 'El Çantası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60501, 'Sırt Çantası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60501, 'Omuz Çantası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60501, 'Valiz');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60501, 'Cüzdan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60502, 'Kolye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60502, 'Küpe');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60502, 'Bilezik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60502, 'Yüzük');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60502, 'Saat');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60503, 'Atkı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60503, 'Bere');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60503, 'Eldiven');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60503, 'Şapka');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60503, 'Kemer');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60503, 'Güneş Gözlüğü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60601, 'Sütyen');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60601, 'Külot');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60601, 'Pijama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60601, 'Gecelik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60601, 'Sabahlık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60602, 'Boxer');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60602, 'Atlet');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60602, 'Çorap');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (60602, 'Pijama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70101, 'Koltuk');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70101, 'Sehpa');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70101, 'TV Ünitesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70101, 'Raf');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70101, 'Kitaplık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70102, 'Yatak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70102, 'Şifonyer');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70102, 'Komodin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70102, 'Gardrop');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70102, 'Makyaj Masası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70103, 'Masa');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70103, 'Sandalye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70103, 'Dolap');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70103, 'Raf Sistemi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70201, 'Nevresim');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70201, 'Çarşaf');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70201, 'Yastık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70201, 'Yatak Örtüsü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70201, 'Pike');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70201, 'Battaniye');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70202, 'Banyo Havlusu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70202, 'Plaj Havlusu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70202, 'El Havlusu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70202, 'Bornoz');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70203, 'Fon Perde');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70203, 'Güneşlik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70203, 'Stor Perde');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70203, 'Tül');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70301, 'Tencere Seti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70301, 'Tava');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70301, 'Düdüklü Tencere');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70301, 'Wok');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70302, 'Yemek Takımı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70302, 'Çatal Bıçak Seti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70302, 'Bardak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70302, 'Fincan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70302, 'Kase');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70303, 'Bıçak Seti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70303, 'Kesme Tahtası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70303, 'Kevgir');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70303, 'Kaşık Seti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70303, 'Açacak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70304, 'Buzdolabı Kabı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70304, 'Cam Saklama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70304, 'Plastik Saklama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70304, 'Vakum Saklama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70401, 'Buzdolabı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70401, 'Çamaşır Makinesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70401, 'Bulaşık Makinesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70401, 'Fırın');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70401, 'Ocak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70402, 'Blender');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70402, 'Mikser');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70402, 'Kahve Makinesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70402, 'Tost Makinesi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70402, 'Ütü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70402, 'Süpürge');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70501, 'Avize');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70501, 'Masa Lambası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70501, 'Abajur');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70501, 'LED Lamba');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70501, 'Spot');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70502, 'Vazo');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70502, 'Çerçeve');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70502, 'Duvar Saati');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70502, 'Mum');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70502, 'Heykel');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (70502, 'Halı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80101, 'Benzin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80101, 'Motorin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80101, 'LPG');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80201, 'İstanbulkart');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80201, 'Ankarakart');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80201, 'Otobüs Bileti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80201, 'Metro');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80201, 'Vapur');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80301, 'Otopark Ücreti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80301, 'Vale');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80302, 'HGS');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80302, 'OGS');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80302, 'Köprü Geçişi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80401, 'Periyodik Bakım');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80401, 'Yağ Değişimi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80401, 'Lastik Değişimi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80401, 'Fren Tamiri');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80402, 'Oto Yıkama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80402, 'Detaylı Temizlik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (80402, 'İç Temizlik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90101, 'Netflix');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90101, 'Disney+');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90101, 'Amazon Prime');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90101, 'Spotify');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90101, 'Apple Music');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90101, 'YouTube Premium');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90102, 'Steam');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90102, 'PlayStation Store');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90102, 'Xbox Store');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90102, 'Mobile Oyun');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90201, 'Roman');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90201, 'Kurgu Dışı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90201, 'Çocuk Kitabı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90201, 'E-Kitap');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90202, 'Dergi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90202, 'Gazete');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90202, 'Dijital Abonelik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90301, 'Sinema Bileti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90301, 'Tiyatro Bileti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90301, 'Konser Bileti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90301, 'Stand-up');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90401, 'Boya');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90401, 'Fırça');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90401, 'Tuval');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90401, 'Kalem Seti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90401, 'Eskiz Defteri');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90402, 'Gitar');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90402, 'Piyano');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90402, 'Bağlama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90402, 'Ud');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (90402, 'Aksesuarlar');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100101, 'Tişört');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100101, 'Şort');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100101, 'Tayt');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100101, 'Eşofman');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100101, 'Koşu Forması');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100102, 'Koşu Ayakkabısı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100102, 'Basketbol Ayakkabısı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100102, 'Futbol Krampon');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100102, 'Tenis Ayakkabısı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100201, 'Dambıl');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100201, 'Yoga Matı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100201, 'Pilates Topu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100201, 'Direnç Bandı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100201, 'Atlama İpi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100202, 'Futbol Topu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100202, 'Basketbol Topu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100202, 'Voleybol Topu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100203, 'Çadır');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100203, 'Uyku Tulumu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100203, 'Kamp Malzemeleri');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100203, 'Bisiklet');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100203, 'Kaykay');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100301, 'Fitness Üyeliği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100301, 'Yüzme Üyeliği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (100301, 'Grup Dersleri');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110101, 'Kalem');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110101, 'Tükenmez');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110101, 'Kurşun Kalem');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110101, 'Silgi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110101, 'Kalemtıraş');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110101, 'Fosforlu Kalem');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110102, 'Defter');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110102, 'Ajanda');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110102, 'Not Defteri');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110102, 'Blok Not');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110103, 'Klasör');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110103, 'Dosya');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110103, 'Poşet Dosya');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110103, 'Zımba');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110103, 'Delgeç');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110201, 'Okul Çantası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110201, 'Sırt Çantası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110201, 'Beslenme Çantası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110202, 'Boya Kalemi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110202, 'Pastel');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110202, 'Suluboya');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110202, 'Makas');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110202, 'Yapıştırıcı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110301, 'Dil Kursu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110301, 'Dersane');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110301, 'Online Eğitim');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (110301, 'Sertifika Programı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120101, 'Elektrik Faturası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120101, 'Doğalgaz Faturası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120102, 'Su Faturası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120103, 'Telefon Faturası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120103, 'İnternet Faturası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120103, 'Mobil Hat');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120201, 'Avukat');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120201, 'Noter');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120201, 'Danışmanlık');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120202, 'Muhasebe');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120202, 'Vergi Danışmanlığı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120301, 'Elektrikçi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120301, 'Tesisatçı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120301, 'Boyacı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120301, 'Marangoz');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120302, 'Ev Temizliği');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120302, 'Halı Yıkama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120302, 'Koltuk Yıkama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120401, 'Kadın Kuaförü');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120401, 'Erkek Berberi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120401, 'Saç Boyama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120401, 'Saç Bakımı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120402, 'Manikür');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120402, 'Pedikür');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120402, 'Kaş Dizaynı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120402, 'Cilt Bakımı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (120402, 'Masaj');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130101, 'Kuru Mama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130101, 'Yaş Mama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130101, 'Ödül Maması');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130102, 'Kedi Kumu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130102, 'Kedi Tuvaleti');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130102, 'Koku Giderici');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130103, 'Kedi Evi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130103, 'Tırmalama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130103, 'Oyuncak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130103, 'Mama Kabı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130201, 'Kuru Mama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130201, 'Yaş Mama');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130201, 'Ödül Maması');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130201, 'Kemik');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130202, 'Tasma');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130202, 'Gezdirme Kayışı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130202, 'Köpek Evi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130202, 'Oyuncak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130202, 'Mama Kabı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130203, 'Şampuan');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130203, 'Tırnak Makası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130203, 'Tüy Tarağı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130203, 'Diş Fırçası');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130301, 'Kuş Yemi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130301, 'Kafes');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130301, 'Su Kabı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130301, 'Tünek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130302, 'Balık Yemi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130302, 'Akvaryum');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130302, 'Filtre');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130302, 'Dekorasyon');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130401, 'Aşı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130401, 'İlaç');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130401, 'Vitamin');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (130401, 'Pire Tasması');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (140101, 'Hayır Kurumu');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (140101, 'Eğitim Bağışı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (140101, 'Sağlık Bağışı');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (140201, 'Hediye Çeki');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (140201, 'Hediye Paketi');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (140201, 'Çiçek');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (140301, 'Sigara');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (140301, 'Çakmak');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (140301, 'Puro');
INSERT INTO item_groups (subcategory_id, name_tr) VALUES
  (140401, 'Çeşitli');

-- Verification queries
-- SELECT COUNT(*) as total_departments FROM departments;
-- SELECT COUNT(*) as total_categories FROM categories;
-- SELECT COUNT(*) as total_subcategories FROM subcategories;
-- SELECT COUNT(*) as total_item_groups FROM item_groups;

-- Sample query to get full hierarchy
-- SELECT 
--   d.name_en as department,
--   c.name_en as category,
--   s.name_en as subcategory,
--   i.name_tr as item_group
-- FROM item_groups i
-- JOIN subcategories s ON i.subcategory_id = s.id
-- JOIN categories c ON s.category_id = c.id
-- JOIN departments d ON c.department_id = d.id
-- WHERE d.id = 1
-- LIMIT 10;
