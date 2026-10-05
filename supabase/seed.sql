-- CareSetu Seed Data
-- 1. 20 Realistic Indian Pharmaceuticals & Medical Equipment
-- 2. 10 REAL Vadodara Hospitals with strict verification rules
-- 3. 3 Demo Ambulances centered in Vadodara (marked is_demo = true)
-- 4. 5 Demo Free Health Camps in Vadodara (marked is_demo = true)

-- ============================================================
-- 1. PRODUCTS (20 ITEMS: MEDICINES & EQUIPMENT)
-- ============================================================
DELETE FROM public.order_items;
DELETE FROM public.cart_items;
DELETE FROM public.products;

INSERT INTO public.products (id, name, description, type, category, price, mrp, stock, requires_prescription, image_url, is_active)
VALUES
  -- Medicines (Prescription & OTC)
  (
    '10000000-0000-0000-0000-000000000001',
    'Dolo 650mg Paracetamol Tablets',
    'Fast relief from fever, body ache, and mild to moderate pain. Pack of 15 tablets.',
    'medicine',
    'Fever & Pain Relief',
    30.50,
    33.60,
    150,
    false,
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Azithral 500mg (Azithromycin)',
    'Broad spectrum macrolide antibiotic used for respiratory tract and skin infections. Pack of 5 tablets.',
    'medicine',
    'Antibiotics',
    119.00,
    132.50,
    80,
    true,
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Augmentin 625 Duo Tablet',
    'Potent combination of Amoxicillin and Potassium Clavulanate for bacterial infections. Strip of 10 tablets.',
    'medicine',
    'Antibiotics',
    201.50,
    223.80,
    60,
    true,
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Glycomet 500 SR (Metformin)',
    'Sustained release oral anti-diabetic formulation for managing Type 2 Diabetes. Strip of 20 tablets.',
    'medicine',
    'Diabetes Care',
    48.00,
    54.00,
    120,
    true,
    'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'Pan 40mg Tablet (Pantoprazole)',
    'Proton pump inhibitor providing effective relief from acidity, heartburn, and GERD. Strip of 15 tablets.',
    'medicine',
    'Digestion & Acidity',
    155.00,
    172.00,
    95,
    false,
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'Cetzine 10mg Tablet (Cetirizine)',
    'Antihistamine for allergic rhinitis, watery eyes, sneezing, and skin itching. Strip of 10 tablets.',
    'medicine',
    'Allergy & Cold',
    21.00,
    23.50,
    200,
    false,
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    'Electral Oral Rehydration Salts (ORS) 21.8g',
    'WHO-formulated oral rehydration salts for restoring electrolytes during dehydration and diarrhea.',
    'medicine',
    'First Aid & Wellness',
    22.00,
    24.20,
    300,
    false,
    'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    'Benadryl Cough Syrup 100ml',
    'Soothing formula for dry cough, throat irritation, and bronchial congestion.',
    'medicine',
    'Allergy & Cold',
    115.00,
    128.00,
    110,
    false,
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    'Volini Pain Relief Gel 50g',
    'Quick absorbing gel with Diclofenac for muscle pain, sprains, and joint discomfort.',
    'medicine',
    'Fever & Pain Relief',
    145.00,
    160.00,
    90,
    false,
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    'Dettol Antiseptic Liquid 550ml',
    'Trusted germ protection for first aid, cuts, grazes, and personal hygiene.',
    'medicine',
    'First Aid & Wellness',
    215.00,
    232.00,
    85,
    false,
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    'Limcee 500mg Vitamin C Chewable Tablets',
    'Immunity booster tablets containing Ascorbic Acid. Pack of 15 chewable tablets.',
    'medicine',
    'Vitamins & Supplements',
    23.50,
    26.00,
    250,
    false,
    'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    'Asthalin 100mcg Inhaler (Salbutamol)',
    'Bronchodilator providing rapid emergency relief from asthma symptoms and bronchospasm.',
    'medicine',
    'Respiratory Care',
    158.00,
    175.00,
    70,
    true,
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    true
  ),

  -- Medical Equipment & Devices
  (
    '10000000-0000-0000-0000-000000000013',
    'Omron HEM-7120 Digital BP Monitor',
    'Clinically validated automatic blood pressure monitor with Intellisense technology and irregular heartbeat detector.',
    'equipment',
    'Monitoring Devices',
    2199.00,
    2640.00,
    45,
    false,
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    'Dr. Trust Professional Pulse Oximeter',
    'Fingertip pulse oximeter for accurate SpO2 oxygen saturation and pulse rate monitoring with OLED display.',
    'equipment',
    'Monitoring Devices',
    1299.00,
    1800.00,
    60,
    false,
    'https://images.unsplash.com/photo-1583912267670-6575ad362e49?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    'Dr. Morepen Digital Clinical Thermometer',
    'Quick 60-second reading, waterproof digital thermometer with fever alarm and memory recall.',
    'equipment',
    'Monitoring Devices',
    199.00,
    275.00,
    180,
    false,
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000016',
    'Accu-Chek Active Blood Glucose Monitor',
    'Simple, accurate blood sugar testing kit with 10 test strips, lancing device, and 10 lancets included.',
    'equipment',
    'Diabetes Care',
    1450.00,
    1699.00,
    50,
    false,
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000017',
    'Omron NE-C28P Compressor Nebulizer',
    'Heavy-duty hospital-grade nebulizer for efficient respiratory therapy for asthma, COPD, and bronchitis.',
    'equipment',
    'Respiratory Care',
    2899.00,
    3450.00,
    30,
    false,
    'https://images.unsplash.com/photo-1583912267670-6575ad362e49?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000018',
    'KosmoCare Standard Steel Folding Wheelchair',
    'Durable chrome-plated steel frame wheelchair with cushioned armrests, footrests, and 100 kg weight capacity.',
    'equipment',
    'Mobility & Support',
    6499.00,
    8200.00,
    15,
    false,
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000019',
    'Friends Easy Adult Diapers (Large, 10 pcs)',
    'High absorbency adult incontinence diapers with wetness indicator and leak-guard barriers.',
    'equipment',
    'Hygiene & Care',
    499.00,
    620.00,
    90,
    false,
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000020',
    'Comprehensive Family First Aid Kit',
    'Emergency medical kit containing sterile gauze, bandages, antiseptic cream, scissors, tape, and emergency guide.',
    'equipment',
    'First Aid & Wellness',
    799.00,
    999.00,
    100,
    false,
    'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80',
    true
  );

-- ============================================================
-- 2. THE 10 REAL VADODARA HOSPITALS (STRICT VERIFICATION)
-- ============================================================
-- Rule: Wrong data is worse than missing data.
-- Phones, specialties, coordinates are NULL if not provided or confirmed.
DELETE FROM public.hospitals;

INSERT INTO public.hospitals (id, name, address, phone, location, is_emergency, specialties, data_verified)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'Zydus Multispeciality and Cancer Hospital',
    'Akshar Chowk, Old Padra Rd, Hira Nagar, Tandalja, Vadodara, Gujarat 390020',
    NULL,
    ST_SetSRID(ST_MakePoint(73.1554, 22.2858), 4326)::geography,
    true,
    ARRAY['Oncology', 'Multispeciality', 'Emergency Care', 'Critical Care'],
    false
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Aadicura Superspeciality Hospital',
    'Jetalpur Rd, behind Gujarat Kidney Hospital, Anand Nagar, Haripura, Vadodara, Gujarat 390007',
    NULL,
    ST_SetSRID(ST_MakePoint(73.1678, 22.3082), 4326)::geography,
    true,
    ARRAY['Superspeciality', 'Cardiology', 'Nephrology', 'Emergency Care'],
    false
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Bhailal Amin General Hospital (BAGH)',
    'Bhailal Amin Marg, Gorwa, Vadodara, Gujarat 390003',
    NULL,
    ST_SetSRID(ST_MakePoint(73.1651, 22.3328), 4326)::geography,
    true,
    ARRAY['General Hospital', 'Trauma Care', 'Cardiology', 'Neurology'],
    false
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'SMS Hospital - Shivanshu Multispeciality Hospital',
    '2nd, 3rd Floor, Ganesh Plaza, near Maneja Crossing Road, Makarpura, Vadodara, Gujarat 390013',
    '+91 81419 65965',
    ST_SetSRID(ST_MakePoint(73.1973, 22.2536), 4326)::geography,
    false,
    ARRAY['Multispeciality', 'General Medicine', 'Orthopedics'],
    false
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'Amicare Multispeciality Hospital',
    'Nilay Park Society, Ajwa Rd, beside Radha Swami Satsang Hall, Kamla Nagar, Vadodara, Gujarat 390019',
    '+91 92748 18895',
    ST_SetSRID(ST_MakePoint(73.2381, 22.3094), 4326)::geography,
    false,
    ARRAY['Multispeciality', 'General Surgery', 'Pediatrics'],
    false
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'Savita Superspeciality Hospital',
    'Waghodia Rd, Sarthi Nagar 2, Kendranagar, Vadodara, Gujarat 390019',
    '+91 265 257 8849',
    ST_SetSRID(ST_MakePoint(73.2365, 22.2965), 4326)::geography,
    false,
    ARRAY['Superspeciality', 'Gastroenterology', 'Urology'],
    false
  ),
  (
    '20000000-0000-0000-0000-000000000007',
    'Samanvay Hospital',
    'Near St. Kabir School, Krishnadham Society, Saiyed Vasna, Vadodara, Gujarat 390012',
    NULL,
    ST_SetSRID(ST_MakePoint(73.1432, 22.2991), 4326)::geography,
    true,
    ARRAY['Emergency Care', 'Critical Care', 'Orthopedics', 'Cardiology'],
    false
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    'Sterling Hospital',
    'Race Course Road, Opposite Inox Cinema, Hari Nagar, Vadodara, Gujarat 390007',
    NULL,
    ST_SetSRID(ST_MakePoint(73.1667, 22.3129), 4326)::geography,
    true,
    ARRAY['Tertiary Care', 'Emergency Trauma', 'Neuroscience', 'Organ Transplant'],
    false
  ),
  (
    '20000000-0000-0000-0000-000000000009',
    'Sir Sayajirao General Hospital (SSG Hospital) - Government',
    'Jail Road, Vadodara, Gujarat 390001',
    NULL,
    ST_SetSRID(ST_MakePoint(73.1932, 22.3045), 4326)::geography,
    true,
    ARRAY['Government Emergency', 'Trauma Center', 'All Specialties', 'Pediatrics'],
    false
  ),
  (
    '20000000-0000-0000-0000-000000000010',
    'Jamnabai General Hospital - Government',
    'Pani Gate Road, Mandvi, Vadodara, Gujarat 390006',
    NULL,
    ST_SetSRID(ST_MakePoint(73.2104, 22.2987), 4326)::geography,
    false,
    ARRAY['Government General Hospital', 'Outpatient Services', 'Maternity'],
    false
  );

-- ============================================================
-- 3. DEMO AMBULANCES (3 IN VADODARA, MARKED is_demo = true)
-- ============================================================
DELETE FROM public.emergency_requests;
DELETE FROM public.ambulances;

INSERT INTO public.ambulances (id, vehicle_number, type, location, is_available, is_demo)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    'GJ-06-AX-1081',
    'icu',
    ST_SetSRID(ST_MakePoint(73.1700, 22.3100), 4326)::geography,
    true,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'GJ-06-BY-1082',
    'basic',
    ST_SetSRID(ST_MakePoint(73.1950, 22.2700), 4326)::geography,
    true,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'GJ-06-CZ-1083',
    'icu',
    ST_SetSRID(ST_MakePoint(73.1850, 22.3250), 4326)::geography,
    true,
    true
  );

-- ============================================================
-- 4. DEMO HEALTH CAMPS (5 IN VADODARA, ALL FREE, is_demo = true)
-- ============================================================
DELETE FROM public.health_camps;

INSERT INTO public.health_camps (id, title, organizer, description, location, address, start_date, end_date, is_free, is_demo)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    'Free Cardiac & BP Screening Camp',
    'Vadodara Rotary Health Mission',
    'Complimentary ECG, Blood Pressure checkup, and cardiologist consultations for senior citizens and adults.',
    ST_SetSRID(ST_MakePoint(73.1812, 22.3130), 4326)::geography,
    'Sayaji Baug Garden Community Hall, Sayajigunj, Vadodara, Gujarat 390020',
    CURRENT_DATE + INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '4 days',
    true,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'Community Eye Checkup & Cataract Screening',
    'Gujarat Blindness Control Society',
    'Free comprehensive vision testing, refraction checks, glaucoma assessment, and subsidized cataract surgery enrollments.',
    ST_SetSRID(ST_MakePoint(73.1990, 22.3210), 4326)::geography,
    'Rotary Hall, Near Bahucharaji Temple, Karelibaug, Vadodara, Gujarat 390018',
    CURRENT_DATE + INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '7 days',
    true,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    'Women & Child Wellness Camp',
    'CareSetu Community Outreach',
    'Specialist pediatric consultations, pediatric nutrition advice, hemoglobin and anemia screening, and basic gynecological consults.',
    ST_SetSRID(ST_MakePoint(73.1410, 22.3180), 4326)::geography,
    'Gotri Community Health Centre, Near Gotri Lake, Vadodara, Gujarat 390021',
    CURRENT_DATE + INTERVAL '8 days',
    CURRENT_DATE + INTERVAL '10 days',
    true,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    'Geriatric Care & Diabetes Detection Camp',
    'Vadodara Elders Welfare Trust',
    'Fasting blood sugar tests, HbA1c tests, bone mineral density checks, and personalized diet counseling for diabetes.',
    ST_SetSRID(ST_MakePoint(73.1620, 22.2900), 4326)::geography,
    'Pensioners Bhavan, Akota Stadium Road, Akota, Vadodara, Gujarat 390020',
    CURRENT_DATE + INTERVAL '12 days',
    CURRENT_DATE + INTERVAL '13 days',
    true,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    'Mega Blood Donation & General Health Camp',
    'Red Cross Society Vadodara',
    'Voluntary blood donation drive alongside general medical consultations, BMI assessment, and basic prescription medicines distribution.',
    ST_SetSRID(ST_MakePoint(73.1870, 22.3200), 4326)::geography,
    'MSU Pavilion Ground, Near Fatehgunj Post Office, Vadodara, Gujarat 390002',
    CURRENT_DATE + INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '16 days',
    true,
    true
  );
