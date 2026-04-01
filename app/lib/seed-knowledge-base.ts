/**
 * RAG Knowledge Base Seed Script
 *
 * Populates the vector store with foundational pharmaceutical regulatory content.
 * Run with: npx tsx app/lib/seed-knowledge-base.ts
 *
 * Requires environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   OLLAMA_BASE_URL, OLLAMA_EMBEDDING_MODEL
 */

const DOCUMENTS = [
    {
        title: 'NAFDAC Drug Registration Process',
        sourceType: 'regulatory' as const,
        sourceUrl: 'https://nafdac.gov.ng',
        content: `# NAFDAC Drug Registration Process for Imported Pharmaceuticals

## Overview
The National Agency for Food and Drug Administration and Control (NAFDAC) is the Nigerian regulatory body responsible for the registration and regulation of all pharmaceuticals, food products, medical devices, and other regulated products.

## Registration Categories
1. **New Drug Application (NDA)** — For products not previously registered in Nigeria
2. **Abbreviated New Drug Application (ANDA)** — For generic versions of already-registered drugs
3. **Variation Application** — For changes to an already-registered product
4. **Renewal Application** — For re-registration of products whose registration has expired

## Required Documents for Drug Registration
1. **Application Form** — NAFDAC prescribed format (Form A)
2. **Certificate of Pharmaceutical Product (CPP)** — Issued by the regulatory authority of the country of origin (Germany: BfArM or PEI)
3. **Good Manufacturing Practice (GMP) Certificate** — From the manufacturing facility, must be current
4. **Certificate of Analysis (CoA)** — For both the active pharmaceutical ingredient (API) and finished product
5. **Product Stability Data** — ICH guidelines compliant, minimum 6 months accelerated stability at 40°C ± 2°C / 75% RH ± 5% RH
6. **Bioequivalence Studies** — Required for generic drugs
7. **Product Samples** — Minimum 20 commercial packs
8. **Artwork/Labelling** — Mock-up of product packaging including package insert
9. **Site Master File** — Detailed description of the manufacturing facility
10. **Drug Master File (DMF)** — For APIs, if applicable
11. **WHO Prequalification Certificate** — Advantageous but not mandatory

## Registration Timeline
- Standard processing: 90–180 working days
- Fast-track (essential medicines): 60–90 working days
- Registration validity: 5 years, renewable

## Fees
- New drug registration: NGN 500,000 – NGN 2,000,000 (depending on category)
- Renewal: NGN 250,000 – NGN 1,000,000
- Variation: NGN 100,000 – NGN 500,000

## Important Notes
- All documents must be notarized and apostilled
- NAFDAC may request a GMP inspection of the manufacturing facility in Germany
- Products must comply with Nigerian Pharmacopoeia or other recognized pharmacopoeia (BP, USP, EP)
- Registration number format: NAFDAC REG. NO: XX-XXXX

## Contact
NAFDAC Registration & Regulatory Affairs Directorate
Website: www.nafdac.gov.ng
Email: registrationinfo@nafdac.gov.ng`,
    },
    {
        title: 'Nigerian Customs Pharmaceutical Import Procedures',
        sourceType: 'regulatory' as const,
        sourceUrl: 'https://customs.gov.ng',
        content: `# Nigerian Customs Service — Pharmaceutical Import Procedures

## Pre-Import Requirements

### 1. Form M
- Required for all imports exceeding USD 10,000
- Obtained from an authorized dealer bank
- Valid for 6 months from date of issue
- Must be processed before the goods leave the country of origin
- Bank charges: approximately 1% of CIF value

### 2. Combined Certificate of Value and Origin (CCVO)
- Must be issued by the Chamber of Commerce in Germany
- Certified by the Nigerian Embassy/Consulate in Germany

### 3. Pre-Arrival Assessment Report (PAAR)
- Obtained from Nigeria Customs Service after Form M is validated
- Contains the duty assessment and classification
- Must be obtained before the goods arrive at Nigerian ports

### 4. NAFDAC Import Permit
- Required for all pharmaceutical products
- Must be obtained before importation
- Valid for the specific consignment only
- Processing time: 2–4 weeks

## HS Codes for Pharmaceutical Products
Common HS codes for pharmaceutical imports from Germany:

| HS Code | Description | Duty Rate |
|---------|-------------|-----------|
| 3003 | Medicaments (not in dosage form) | 5% |
| 3004.10 | Medicaments containing penicillins | 5% |
| 3004.20 | Medicaments containing antibiotics | 5% |
| 3004.31 | Medicaments containing insulin | 0% |
| 3004.32 | Medicaments containing corticosteroids | 5% |
| 3004.39 | Medicaments containing other hormones | 5% |
| 3004.41 | Medicaments containing ephedrine or pseudoephedrine | 5% |
| 3004.49 | Medicaments containing alkaloids | 5% |
| 3004.50 | Vitamins and supplements | 10% |
| 3004.60 | Antimalarial medicaments | 0% |
| 3004.90 | Other medicaments | 5–10% |
| 3002.11 | Antisera and immunological products | 5% |
| 3002.12 | Vaccines for human medicine | 0% |
| 3006 | Pharmaceutical goods (surgical sutures, first-aid kits) | 5% |
| 2941 | Antibiotics (bulk/API) | 5% |
| 2942 | Other organic compounds (API) | 5% |

## Import Duties and Taxes
- **Import Duty**: 5–20% (most pharmaceuticals at 5%)
- **VAT**: 7.5% on CIF + Duty
- **CISS Levy**: 1% of CIF value
- **ETLS (ECOWAS Trade Liberalization Scheme)**: May apply for certain goods
- **Surcharge**: 7% (Comprehensive Import Supervision Scheme)

## Port Clearance Process
1. Submission of shipping documents to customs broker
2. PAAR validation at the port
3. Physical examination of goods
4. NAFDAC verification and clearance
5. Duty payment through designated banks
6. Release of goods

## Required Shipping Documents
1. Bill of Lading (original)
2. Commercial Invoice (3 copies)
3. Packing List
4. Certificate of Origin
5. Form M (stamped by bank)
6. NAFDAC Import Permit
7. Insurance Certificate
8. PAAR number
9. Phytosanitary Certificate (if applicable)
10. Quality Control Certificate / Certificate of Analysis

## Storage Requirements
- Pharmaceutical imports must be cleared to bonded warehouses with proper temperature control
- Cold chain products require documented temperature monitoring during transit

## Penalties
- Importing without NAFDAC permit: product seizure and prosecution
- Incorrect HS code declaration: fines up to 50% of product value
- False documentation: criminal prosecution`,
    },
    {
        title: 'German Pharmaceutical Export Regulations',
        sourceType: 'regulatory' as const,
        sourceUrl: 'https://www.bfarm.de',
        content: `# German Pharmaceutical Export Regulations

## Regulatory Framework
German pharmaceutical exports are governed by:
- **Arzneimittelgesetz (AMG)** — German Medicinal Products Act
- **EU Directive 2001/83/EC** — Community code for medicinal products
- **EU Falsified Medicines Directive (FMD) 2011/62/EU** — Anti-counterfeiting requirements
- **EU Good Manufacturing Practice (GMP)** — Annex 16 certification for release

## Key Regulatory Bodies
1. **BfArM (Bundesinstitut für Arzneimittel und Medizinprodukte)** — Federal Institute for Drugs and Medical Devices. Regulates conventional pharmaceuticals.
2. **PEI (Paul-Ehrlich-Institut)** — Regulates vaccines, sera, blood products, and biologics.
3. **BAFA (Bundesamt für Wirtschaft und Ausfuhrkontrolle)** — Federal Office for Economic Affairs and Export Control. Issues export licenses for controlled substances.

## Export Documentation from Germany
1. **Certificate of Pharmaceutical Product (CPP)** — Issued by BfArM or PEI, confirms the product is registered and manufactured under GMP in Germany. Processing time: 2–4 weeks.
2. **GMP Certificate** — Issued by the Regierungspräsidium (regional government) after factory inspection. Valid for 3 years.
3. **WHO-type GMP Certificate** — If exporting to WHO member states. Additional to EU GMP.
4. **Certificate of Analysis (CoA)** — Issued by the manufacturer's quality control lab for each batch.
5. **Free Sale Certificate** — Confirms the product is legally marketed in Germany.
6. **Export Declaration (Ausfuhranmeldung)** — Required for shipments over EUR 1,000 via ATLAS system.
7. **EUR.1 Movement Certificate** — For preferential tariff treatment under trade agreements.

## GMP Standards
German manufacturers must comply with:
- **EU GMP (Eudralex Volume 4)** — Mandatory for all EU manufacturers
- **WHO-GMP** — Recommended for exports to developing countries
- **PIC/S GMP** — Pharmaceutical Inspection Co-operation Scheme
- **ISO 9001** — Quality management system (supplementary)
- **ISO 13485** — For medical devices manufactured alongside pharma

## Controlled Substances Export
- Narcotics and psychotropic substances require a BAFA export license
- BtM (Betäubungsmittel) license required for Schedule I–III substances
- End-user certificate from the importing country required
- Processing time: 4–8 weeks

## Certifications Valued by Nigerian Importers
1. EU GMP Certificate
2. WHO-GMP Certificate
3. ISO 9001:2015
4. CE Mark (for medical devices)
5. WHO Prequalification
6. PIC/S membership certificate
7. Free Sale Certificate

## Shipping Requirements
- Pharmaceutical products must be shipped in GDP-compliant conditions
- Temperature-sensitive products require qualified shipping containers
- Good Distribution Practice (GDP) Certificate for logistics partners
- Air freight preferred for temperature-sensitive products (Frankfurt, Munich airports have pharma hubs)

## Key German Pharma Export Hubs
- **Frankfurt** — Largest pharma manufacturing cluster, major air cargo hub
- **Munich/Bavaria** — Biotech and specialty pharma concentration
- **Hamburg** — Major port for sea freight, bulk API exports
- **Berlin/Brandenburg** — Growing biotech sector
- **Baden-Württemberg** — Medical device and pharma manufacturing`,
    },
    {
        title: 'PharmConnect Platform Guide',
        sourceType: 'platform' as const,
        content: `# PharmConnect Platform Guide

## What is PharmConnect?
PharmConnect is a B2B digital marketplace that connects Nigerian pharmaceutical vendors with verified German pharmaceutical manufacturers and exporters. The platform facilitates trade relationships, regulatory compliance, and supply chain transparency.

## Key Features

### 1. Supplier Marketplace
- Browse verified German pharmaceutical suppliers
- Filter by product category, certification, and export markets
- View detailed supplier profiles with certifications and product catalogs
- Suppliers are verified through a multi-step process including GMP certificate validation

### 2. Product Discovery
- Search pharmaceutical products by name, category, or HS code
- Compare products across multiple suppliers
- View detailed specifications including:
  - Active pharmaceutical ingredients
  - Dosage forms and strengths
  - HS/tariff codes for customs classification
  - Minimum order quantities
  - Required certifications

### 3. Document Vault
- Securely store and manage import documentation
- Track document expiration dates
- Organize by document type:
  - NAFDAC Import Permits
  - Certificates of Analysis
  - GMP Certificates
  - Bills of Lading
  - Commercial Invoices
  - Form M documentation

### 4. Inquiry System
- Send structured inquiries directly to suppliers
- Track inquiry status (pending, responded, closed)
- Maintain communication history

### 5. PharmAgent AI Assistant
- Get instant answers about:
  - NAFDAC registration requirements
  - Nigerian Customs import procedures
  - German export regulations
  - HS code classification
  - Required documentation
  - Supplier recommendations
- Powered by RAG (Retrieval-Augmented Generation) for accurate, sourced information
- Can search the web for the latest regulatory updates

## Product Categories Available
1. **Antibiotics** — Penicillins, cephalosporins, macrolides, fluoroquinolones
2. **Cardiovascular** — Antihypertensives, statins, anticoagulants, cardiac glycosides
3. **Vaccines** — Childhood immunizations, travel vaccines, flu vaccines
4. **Biologics** — Monoclonal antibodies, biosimilars, recombinant proteins
5. **Diagnostics** — Rapid test kits, laboratory reagents, imaging contrast agents
6. **APIs (Active Pharmaceutical Ingredients)** — Bulk raw materials for local formulation
7. **Oncology** — Chemotherapy agents, targeted therapies, supportive care

## For Nigerian Vendors
1. Create an account and complete your vendor profile
2. Browse the supplier marketplace
3. Send inquiries to suppliers of interest
4. Upload and manage your import documentation
5. Use PharmAgent for regulatory guidance

## For German Suppliers
1. Register and complete your supplier profile
2. Upload your GMP certificate and other certifications
3. Add your product catalog
4. Respond to vendor inquiries
5. Get verified to appear prominently in search results`,
    },
    {
        title: 'HS Code Guide for Pharmaceutical Products — Nigeria',
        sourceType: 'regulatory' as const,
        content: `# HS Code Classification Guide for Pharmaceutical Products

## Understanding HS Codes
The Harmonized System (HS) is an internationally standardized system of names and numbers to classify traded products. Nigeria uses the ECOWAS Common External Tariff (CET) based on the HS system.

## Chapter 29: Organic Chemicals (APIs)
- **2941.10** — Penicillins and their derivatives (5% duty)
- **2941.20** — Streptomycins and their derivatives (5% duty)
- **2941.30** — Tetracyclines and their derivatives (5% duty)
- **2941.40** — Chloramphenicol and derivatives (5% duty)
- **2941.50** — Erythromycin and derivatives (5% duty)
- **2941.90** — Other antibiotics (5% duty)
- **2942.00** — Other organic compounds (5% duty)

## Chapter 30: Pharmaceutical Products
### 3002 — Biological Products
- **3002.11** — Antisera, blood fractions, immunological products (5%)
- **3002.12** — Vaccines for human medicine (0% — exempt)
- **3002.13** — Vaccines for veterinary medicine (5%)
- **3002.14** — Blood products (5%)
- **3002.15** — Immunological products for retail sale (5%)

### 3003 — Medicaments Not in Dosage Form
- **3003.10** — Containing penicillins/streptomycin (5%)
- **3003.20** — Containing other antibiotics (5%)
- **3003.31** — Containing insulin (0%)
- **3003.39** — Containing other hormones (5%)
- **3003.41** — Containing ephedrine (5%)
- **3003.42** — Containing pseudoephedrine (5%)
- **3003.43** — Containing norephedrine (5%)
- **3003.49** — Other alkaloid-containing (5%)
- **3003.60** — Antimalarial preparations (0%)
- **3003.90** — Other (5%)

### 3004 — Medicaments in Dosage Form (Retail)
- **3004.10** — Containing penicillins/streptomycin (5%)
- **3004.20** — Containing other antibiotics (5%)
- **3004.31** — Containing insulin (0%)
- **3004.32** — Containing corticosteroids (5%)
- **3004.39** — Containing other hormones (5%)
- **3004.41** — Containing ephedrine (5%)
- **3004.49** — Other alkaloid-containing (5%)
- **3004.50** — Vitamins/provitamins (10%)
- **3004.60** — Antimalarial preparations (0%)
- **3004.90** — Other medicaments (5-10%)

### 3005 — Bandages and Dressings
- **3005.10** — Adhesive bandages (10%)
- **3005.90** — Other dressings (10%)

### 3006 — Pharmaceutical Goods
- **3006.10** — Sterile surgical sutures (5%)
- **3006.20** — Blood-grouping reagents (5%)
- **3006.30** — Opacifying preparations for X-ray (5%)
- **3006.40** — Dental cements (5%)
- **3006.50** — First-aid kits (10%)
- **3006.60** — Contraceptive preparations (0%)
- **3006.70** — Gel preparations (5%)

## Duty-Free Categories (0%)
The following pharmaceutical categories enjoy duty-free importation:
- Vaccines for human medicine (3002.12)
- Insulin preparations (3003.31, 3004.31)
- Antimalarial medicines (3003.60, 3004.60)
- Contraceptive preparations (3006.60)
- Antiretroviral medicines (under special ECOWAS provisions)

## Important Notes
1. Always verify HS codes with the latest Nigerian Customs tariff schedule
2. Incorrect classification can result in penalties up to 50% of CIF value
3. Some products may require additional classification certificates
4. ECOWAS Trade Liberalization Scheme may provide additional tariff benefits
5. Pre-Arrival Assessment Report (PAAR) will confirm the applicable HS code and duty rate`,
    },
]

async function seedKnowledgeBase(): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const apiKey = process.env.RAG_ADMIN_API_KEY

    if (!apiKey) {
        console.error('RAG_ADMIN_API_KEY is required. Set it in .env.local')
        process.exit(1)
    }

    console.log(`Seeding knowledge base via ${baseUrl}/api/agent/knowledge`)
    console.log(`Documents to ingest: ${DOCUMENTS.length}`)

    for (const doc of DOCUMENTS) {
        console.log(`\nIngesting: ${doc.title}`)
        console.log(`  Source type: ${doc.sourceType}`)
        console.log(`  Content length: ${doc.content.length} chars`)

        const response = await fetch(`${baseUrl}/api/agent/knowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                title: doc.title,
                content: doc.content,
                sourceType: doc.sourceType,
                sourceUrl: doc.sourceUrl,
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            console.error(`  FAILED: ${response.status} — ${error}`)
            continue
        }

        const result = await response.json() as { documentId: string; chunksCreated: number }
        console.log(`  OK: document=${result.documentId}, chunks=${result.chunksCreated}`)
    }

    console.log('\nDone!')
}

seedKnowledgeBase().catch(console.error)
