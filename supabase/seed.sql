-- Seed data: German pharmaceutical suppliers for PharmConnect marketplace
-- Run after migrations: psql -f seed.sql or via Supabase dashboard

-- Note: These are demonstration suppliers. In production, supplier accounts
-- would be created through the registration flow with real auth.users entries.
-- For seeding, we insert directly into suppliers table (bypassing RLS via service role).

-- ─── Placeholder profiles (one per supplier, role=vendor avoids trigger conflict) ──

insert into public.profiles (id, email, full_name, role, company_name, country)
values
  ('b1000000-0000-0000-0000-000000000001', 'seed+berlinpharma@pharmvic.dev', 'BerlinPharma GmbH', 'vendor', 'BerlinPharma GmbH', 'Germany'),
  ('b1000000-0000-0000-0000-000000000002', 'seed+munichmed@pharmvic.dev', 'MunichMed AG', 'vendor', 'MunichMed AG', 'Germany'),
  ('b1000000-0000-0000-0000-000000000003', 'seed+hamburgbio@pharmvic.dev', 'HamburgBio GmbH', 'vendor', 'HamburgBio GmbH', 'Germany'),
  ('b1000000-0000-0000-0000-000000000004', 'seed+rheindiagnostik@pharmvic.dev', 'RheinDiagnostik AG', 'vendor', 'RheinDiagnostik AG', 'Germany'),
  ('b1000000-0000-0000-0000-000000000005', 'seed+frankfurtapi@pharmvic.dev', 'FrankfurtAPI GmbH', 'vendor', 'FrankfurtAPI GmbH', 'Germany'),
  ('b1000000-0000-0000-0000-000000000006', 'seed+stuttgartonco@pharmvic.dev', 'StuttgartOnco GmbH', 'vendor', 'StuttgartOnco GmbH', 'Germany'),
  ('b1000000-0000-0000-0000-000000000007', 'seed+dusseldorfgenerix@pharmvic.dev', 'DüsseldorfGeneriX GmbH', 'vendor', 'DüsseldorfGeneriX GmbH', 'Germany'),
  ('b1000000-0000-0000-0000-000000000008', 'seed+leipzignatural@pharmvic.dev', 'LeipzigNatural AG', 'vendor', 'LeipzigNatural AG', 'Germany'),
  ('b1000000-0000-0000-0000-000000000009', 'seed+nuernbergpharmapack@pharmvic.dev', 'NürnbergPharmapack GmbH', 'vendor', 'NürnbergPharmapack GmbH', 'Germany'),
  ('b1000000-0000-0000-0000-000000000010', 'seed+bremenbiotech@pharmvic.dev', 'BremenBiotech GmbH', 'vendor', 'BremenBiotech GmbH', 'Germany')
on conflict (id) do nothing;

-- ─── Suppliers (10 German pharmaceutical manufacturers) ──────────────────────

-- Supplier 1: BerlinPharma GmbH
insert into public.suppliers (id, user_id, company_name, country, description, address, website, founded_year, export_markets, certifications, verified)
values (
  'a1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  'BerlinPharma GmbH',
  'Germany',
  'Leading German manufacturer of antibiotics and cardiovascular medications. ISO-certified production facilities with 40+ years of pharmaceutical manufacturing excellence.',
  'Pharmastraße 12, 10115 Berlin, Germany',
  'https://example.com/berlinpharma',
  1983,
  ARRAY['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt'],
  ARRAY['GMP', 'WHO-GMP', 'ISO 9001', 'EU GMP'],
  true
) on conflict (id) do nothing;

-- Supplier 2: MunichMed AG
insert into public.suppliers (id, user_id, company_name, country, description, address, website, founded_year, export_markets, certifications, verified)
values (
  'a1000000-0000-0000-0000-000000000002',
  'b1000000-0000-0000-0000-000000000002',
  'MunichMed AG',
  'Germany',
  'Specializing in analgesics and anti-inflammatory medications. Our Munich-based facility serves pharmaceutical distributors across Africa and the Middle East.',
  'Medizinweg 45, 80331 München, Germany',
  'https://example.com/munichmed',
  1996,
  ARRAY['Nigeria', 'Tanzania', 'UAE', 'Saudi Arabia'],
  ARRAY['GMP', 'CE Mark', 'ISO 9001', 'ISO 14001'],
  true
) on conflict (id) do nothing;

-- Supplier 3: HamburgBio GmbH
insert into public.suppliers (id, user_id, company_name, country, description, address, website, founded_year, export_markets, certifications, verified)
values (
  'a1000000-0000-0000-0000-000000000003',
  'b1000000-0000-0000-0000-000000000003',
  'HamburgBio GmbH',
  'Germany',
  'Cutting-edge biologics and vaccine manufacturer. PEI-approved facility producing high-quality immunological products for global distribution.',
  'Biopark 7, 20457 Hamburg, Germany',
  'https://example.com/hamburgbio',
  2005,
  ARRAY['Nigeria', 'Ethiopia', 'Morocco', 'India'],
  ARRAY['WHO-GMP', 'EU GMP', 'PEI Approved', 'ISO 9001'],
  true
) on conflict (id) do nothing;

-- Supplier 4: RheinDiagnostik AG
insert into public.suppliers (id, user_id, company_name, country, description, address, website, founded_year, export_markets, certifications, verified)
values (
  'a1000000-0000-0000-0000-000000000004',
  'b1000000-0000-0000-0000-000000000004',
  'RheinDiagnostik AG',
  'Germany',
  'Premier manufacturer of diagnostic reagents and medical devices. Serving hospitals and laboratories in over 30 countries with quality-assured products.',
  'Diagnostikplatz 3, 50667 Köln, Germany',
  'https://example.com/rheindiagnostik',
  2001,
  ARRAY['Nigeria', 'Cameroon', 'Senegal', 'Côte d''Ivoire'],
  ARRAY['CE Mark', 'ISO 13485', 'ISO 9001', 'GMP'],
  true
) on conflict (id) do nothing;

-- Supplier 5: FrankfurtAPI GmbH
insert into public.suppliers (id, user_id, company_name, country, description, address, website, founded_year, export_markets, certifications, verified)
values (
  'a1000000-0000-0000-0000-000000000005',
  'b1000000-0000-0000-0000-000000000005',
  'FrankfurtAPI GmbH',
  'Germany',
  'Specialist producer of Active Pharmaceutical Ingredients (APIs). GMP-compliant synthesis of bulk pharmaceutical chemicals for global markets.',
  'Chemiepark 22, 60311 Frankfurt am Main, Germany',
  'https://example.com/frankfurtapi',
  1990,
  ARRAY['Nigeria', 'Bangladesh', 'Indonesia', 'Brazil'],
  ARRAY['GMP', 'WHO-GMP', 'ISO 9001', 'ICH Q7 Compliant'],
  true
) on conflict (id) do nothing;

-- Supplier 6: StuttgartOnco GmbH
insert into public.suppliers (id, user_id, company_name, country, description, address, website, founded_year, export_markets, certifications, verified)
values (
  'a1000000-0000-0000-0000-000000000006',
  'b1000000-0000-0000-0000-000000000006',
  'StuttgartOnco GmbH',
  'Germany',
  'Dedicated oncology pharmaceutical manufacturer. Producing chemotherapy agents and supportive care medications under the strictest quality standards.',
  'Onkologiestr. 8, 70173 Stuttgart, Germany',
  'https://example.com/stuttgartonco',
  2010,
  ARRAY['Nigeria', 'South Africa', 'Kenya'],
  ARRAY['EU GMP', 'WHO-GMP', 'ISO 9001'],
  false
) on conflict (id) do nothing;

-- Products for BerlinPharma
insert into public.products (supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications) values
('a1000000-0000-0000-0000-000000000001', 'Amoxicillin 500mg Capsules', 'Broad-spectrum antibiotic, 500mg capsules, 100-count bottles', '3004.10', 'Antibiotics', 10000, 'bottles', ARRAY['GMP', 'WHO-GMP']),
('a1000000-0000-0000-0000-000000000001', 'Ciprofloxacin 250mg Tablets', 'Fluoroquinolone antibiotic tablets', '3004.10', 'Antibiotics', 5000, 'bottles', ARRAY['GMP', 'WHO-GMP']),
('a1000000-0000-0000-0000-000000000001', 'Amlodipine 5mg Tablets', 'Calcium channel blocker for hypertension', '3004.90', 'Cardiovascular', 8000, 'packs', ARRAY['GMP', 'ISO 9001']),
('a1000000-0000-0000-0000-000000000001', 'Metformin 500mg Tablets', 'Oral antidiabetic, immediate release', '3004.90', 'Cardiovascular', 10000, 'packs', ARRAY['GMP', 'EU GMP']);

-- Products for MunichMed
insert into public.products (supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications) values
('a1000000-0000-0000-0000-000000000002', 'Ibuprofen 400mg Tablets', 'NSAID anti-inflammatory tablets', '3004.90', 'Anti-inflammatories', 20000, 'packs', ARRAY['GMP', 'CE Mark']),
('a1000000-0000-0000-0000-000000000002', 'Paracetamol 500mg Tablets', 'Analgesic and antipyretic', '3004.90', 'Analgesics', 50000, 'packs', ARRAY['GMP', 'ISO 9001']),
('a1000000-0000-0000-0000-000000000002', 'Diclofenac 50mg Tablets', 'NSAID for pain and inflammation', '3004.90', 'Anti-inflammatories', 15000, 'packs', ARRAY['GMP', 'CE Mark']);

-- Products for HamburgBio
insert into public.products (supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications) values
('a1000000-0000-0000-0000-000000000003', 'Hepatitis B Vaccine', 'Recombinant hepatitis B vaccine, single-dose vials', '3002.12', 'Vaccines', 1000, 'vials', ARRAY['WHO-GMP', 'PEI Approved']),
('a1000000-0000-0000-0000-000000000003', 'Tetanus Toxoid Vaccine', 'Tetanus toxoid for immunization programs', '3002.12', 'Vaccines', 2000, 'vials', ARRAY['WHO-GMP', 'PEI Approved']),
('a1000000-0000-0000-0000-000000000003', 'Erythropoietin Injection', 'Recombinant EPO for anemia treatment', '3002.13', 'Biologics', 500, 'pre-filled syringes', ARRAY['EU GMP', 'ISO 9001']);

-- Products for RheinDiagnostik
insert into public.products (supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications) values
('a1000000-0000-0000-0000-000000000004', 'Rapid Malaria Test Kit', 'Immunochromatographic rapid diagnostic test', '3006.30', 'Diagnostics', 5000, 'kits', ARRAY['CE Mark', 'ISO 13485']),
('a1000000-0000-0000-0000-000000000004', 'Blood Glucose Test Strips', 'Electrochemical glucose test strips, 50-count', '3006.30', 'Diagnostics', 10000, 'boxes', ARRAY['CE Mark', 'ISO 13485']),
('a1000000-0000-0000-0000-000000000004', 'Digital Blood Pressure Monitor', 'Automatic upper arm BP monitor', '9018.19', 'Medical Devices', 1000, 'units', ARRAY['CE Mark', 'ISO 13485']);

-- Products for FrankfurtAPI
insert into public.products (supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications) values
('a1000000-0000-0000-0000-000000000005', 'Amoxicillin Trihydrate API', 'Bulk API for tablet/capsule formulation', '2941.10', 'APIs', 500, 'kg', ARRAY['GMP', 'WHO-GMP', 'ICH Q7 Compliant']),
('a1000000-0000-0000-0000-000000000005', 'Metformin HCl API', 'Bulk active ingredient for antidiabetic formulations', '2942.00', 'APIs', 1000, 'kg', ARRAY['GMP', 'ICH Q7 Compliant']),
('a1000000-0000-0000-0000-000000000005', 'Paracetamol DC Grade', 'Direct compression grade paracetamol powder', '2924.29', 'APIs', 2000, 'kg', ARRAY['GMP', 'ISO 9001']);

-- Products for StuttgartOnco
insert into public.products (supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications) values
('a1000000-0000-0000-0000-000000000006', 'Cisplatin Injection 50mg', 'Platinum-based chemotherapy agent', '3004.90', 'Oncology', 200, 'vials', ARRAY['EU GMP', 'WHO-GMP']),
('a1000000-0000-0000-0000-000000000006', 'Ondansetron 8mg Tablets', 'Anti-emetic for chemotherapy-induced nausea', '3004.90', 'Oncology', 5000, 'packs', ARRAY['EU GMP', 'ISO 9001']);

-- Supplier 7: DüsseldorfGeneriX GmbH
insert into public.suppliers (id, user_id, company_name, country, description, address, website, founded_year, export_markets, certifications, verified)
values (
  'a1000000-0000-0000-0000-000000000007',
  'b1000000-0000-0000-0000-000000000007',
  'DüsseldorfGeneriX GmbH',
  'Germany',
  'Leading German generics manufacturer supplying affordable, BfArM-approved pharmaceutical formulations to emerging markets. Our state-of-the-art facility in Düsseldorf holds EU GMP and WHO-GMP certifications.',
  'Genericaweg 18, 40213 Düsseldorf, Germany',
  'https://example.com/dusseldorfgenerix',
  1988,
  ARRAY['Nigeria', 'Ghana', 'Uganda', 'Mozambique', 'Zambia'],
  ARRAY['EU GMP', 'WHO-GMP', 'ISO 9001', 'GMP'],
  true
) on conflict (id) do nothing;

-- Supplier 8: LeipzigNatural AG
insert into public.suppliers (id, user_id, company_name, country, description, address, website, founded_year, export_markets, certifications, verified)
values (
  'a1000000-0000-0000-0000-000000000008',
  'b1000000-0000-0000-0000-000000000008',
  'LeipzigNatural AG',
  'Germany',
  'Specialist in herbal medicinal products and phytopharmaceuticals. BfArM-registered Traditional Herbal Medicine (THM) producer with over 200 plant-based formulations approved for the European and African markets.',
  'Kräuterring 5, 04109 Leipzig, Germany',
  'https://example.com/leipzignatural',
  1975,
  ARRAY['Nigeria', 'Senegal', 'Côte d''Ivoire', 'Egypt', 'Morocco'],
  ARRAY['EU GMP', 'ISO 9001', 'ISO 14001', 'GMP'],
  true
) on conflict (id) do nothing;

-- Supplier 9: NürnbergPharmapack GmbH
insert into public.suppliers (id, user_id, company_name, country, description, address, website, founded_year, export_markets, certifications, verified)
values (
  'a1000000-0000-0000-0000-000000000009',
  'b1000000-0000-0000-0000-000000000009',
  'NürnbergPharmapack GmbH',
  'Germany',
  'Contract manufacturing and pharmaceutical packaging specialist. Providing blister packaging, liquid fill-finish, and secondary packaging solutions for European and African pharmaceutical clients under EU GMP conditions.',
  'Verpackungsstraße 33, 90402 Nürnberg, Germany',
  'https://example.com/nuernbergpharmapack',
  2003,
  ARRAY['Nigeria', 'South Africa', 'Kenya', 'Tanzania'],
  ARRAY['EU GMP', 'ISO 15378', 'ISO 9001', 'GMP'],
  true
) on conflict (id) do nothing;

-- Supplier 10: BremenBiotech GmbH
insert into public.suppliers (id, user_id, company_name, country, description, address, website, founded_year, export_markets, certifications, verified)
values (
  'a1000000-0000-0000-0000-000000000010',
  'b1000000-0000-0000-0000-000000000010',
  'BremenBiotech GmbH',
  'Germany',
  'Innovative biotechnology company developing monoclonal antibodies and advanced biopharmaceuticals. Our Bremen facility operates under ICH Q10 pharmaceutical quality system standards with full BfArM oversight.',
  'Biotechpark 2, 28195 Bremen, Germany',
  'https://example.com/bremenbiotech',
  2012,
  ARRAY['Nigeria', 'South Africa', 'Egypt', 'Kenya'],
  ARRAY['EU GMP', 'WHO-GMP', 'ISO 9001', 'ICH Q10'],
  false
) on conflict (id) do nothing;

-- Products for DüsseldorfGeneriX (supplier 7)
insert into public.products (supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications) values
('a1000000-0000-0000-0000-000000000007', 'Omeprazole 20mg Capsules', 'Proton pump inhibitor, delayed-release capsules', '3004.90', 'Gastrointestinal', 30000, 'packs', ARRAY['EU GMP', 'GMP']),
('a1000000-0000-0000-0000-000000000007', 'Atorvastatin 40mg Tablets', 'HMG-CoA reductase inhibitor for cholesterol management', '3004.90', 'Cardiovascular', 20000, 'packs', ARRAY['EU GMP', 'WHO-GMP']),
('a1000000-0000-0000-0000-000000000007', 'Lisinopril 10mg Tablets', 'ACE inhibitor for hypertension and heart failure', '3004.90', 'Cardiovascular', 25000, 'packs', ARRAY['EU GMP', 'GMP']);

-- Products for LeipzigNatural (supplier 8)
insert into public.products (supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications) values
('a1000000-0000-0000-0000-000000000008', 'Valerian Root Extract 450mg', 'Standardised valerian extract for sleep and anxiety', '3004.90', 'Herbal Medicines', 10000, 'packs', ARRAY['EU GMP', 'GMP']),
('a1000000-0000-0000-0000-000000000008', 'Echinacea Purpurea Tincture', 'Immune-support herbal tincture, 50ml bottles', '3004.90', 'Herbal Medicines', 5000, 'bottles', ARRAY['EU GMP', 'ISO 9001']),
('a1000000-0000-0000-0000-000000000008', 'St John''s Wort 300mg Tablets', 'Standardised hypericum extract, mood support', '3004.90', 'Herbal Medicines', 15000, 'packs', ARRAY['EU GMP', 'GMP']);

-- Products for NürnbergPharmapack (supplier 9)
insert into public.products (supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications) values
('a1000000-0000-0000-0000-000000000009', 'Blister Pack — 10 × 10 Alu/PVC', 'Pharmaceutical blister packaging, 100-tablet Alu/PVC format', '3923.90', 'Packaging', 500000, 'units', ARRAY['ISO 15378', 'EU GMP']),
('a1000000-0000-0000-0000-000000000009', 'Liquid Fill-Finish Contract (5ml vials)', 'Sterile liquid fill-finish service for injectable products', '3004.90', 'Contract Manufacturing', 50000, 'vials', ARRAY['EU GMP', 'ISO 9001']),
('a1000000-0000-0000-0000-000000000009', 'HDPE Tablet Bottles (250ml)', 'Child-resistant HDPE bottles with tamper-evident closure', '3923.30', 'Packaging', 100000, 'units', ARRAY['ISO 15378', 'EU GMP']);

-- Products for BremenBiotech (supplier 10)
insert into public.products (supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications) values
('a1000000-0000-0000-0000-000000000010', 'Anti-PD-1 Monoclonal Antibody (research grade)', 'Recombinant anti-PD-1 mAb for immuno-oncology research', '3002.15', 'Biologics', 100, 'vials', ARRAY['EU GMP', 'ICH Q10']),
('a1000000-0000-0000-0000-000000000010', 'Trastuzumab Biosimilar (preclinical batch)', 'HER2-targeting biosimilar under BfArM development pipeline', '3002.15', 'Biologics', 50, 'vials', ARRAY['EU GMP', 'WHO-GMP']),
('a1000000-0000-0000-0000-000000000010', 'Pegylated Interferon Alpha-2a', 'Long-acting interferon for viral hepatitis treatment', '3002.13', 'Biologics', 200, 'pre-filled syringes', ARRAY['EU GMP', 'ISO 9001']);

