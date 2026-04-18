import { tool } from 'ai'
import { z } from 'zod'
import sql from '@/lib/db/client'

/**
 * Supplier Search Tool
 * Queries the Docker PostgreSQL database for German pharmaceutical manufacturers.
 */
export const supplierSearchTool = tool({
    description: 'Search the PharmConnect marketplace for German pharmaceutical suppliers. Use this when the user asks about finding suppliers, manufacturers, or specific pharmaceutical products. Returns supplier profiles with certifications and product listings.',
    inputSchema: z.object({
        query: z.string().optional()
            .describe('Search term for supplier name, description, or product'),
        category: z.string().optional()
            .describe('Product category filter (e.g., Antibiotics, Cardiovascular, Vaccines, Biologics, Diagnostics, APIs, Oncology)'),
        certification: z.string().optional()
            .describe('Certification filter (e.g., GMP, WHO-GMP, ISO 9001, CE Mark)'),
        verifiedOnly: z.boolean().optional()
            .describe('Only return verified suppliers (default true)'),
    }),
    execute: async ({ query, category, certification, verifiedOnly }) => {
        const verifiedFilter = verifiedOnly !== false

        const suppliers = await sql`
            SELECT id, company_name, description, certifications, verified, country, website
            FROM suppliers
            WHERE
                (${verifiedFilter} = false OR verified = true)
                AND (${query ?? null} IS NULL
                    OR company_name ILIKE ${'%' + (query ?? '') + '%'}
                    OR description  ILIKE ${'%' + (query ?? '') + '%'})
                AND (${certification ?? null} IS NULL
                    OR certifications @> ARRAY[${certification ?? ''}])
            ORDER BY company_name
            LIMIT 10
        `

        if (suppliers.length === 0) {
            return { message: 'No suppliers found matching your criteria.', results: [] }
        }

        const supplierIds = suppliers.map((s) => s.id as string)

        const products = await sql`
            SELECT id, supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications
            FROM products
            WHERE supplier_id = ANY(${supplierIds})
                AND (${category ?? null} IS NULL OR category ILIKE ${'%' + (category ?? '') + '%'})
                AND (${(query && !category) ? query : null} IS NULL
                    OR name        ILIKE ${'%' + (query ?? '') + '%'}
                    OR description ILIKE ${'%' + (query ?? '') + '%'}
                    OR category    ILIKE ${'%' + (query ?? '') + '%'})
            LIMIT 30
        `

        const results = suppliers.map((supplier) => {
            const supplierProducts = products
                .filter((p) => p.supplier_id === supplier.id)
                .map((p) => ({
                    name: p.name,
                    category: p.category,
                    hsCode: p.hs_code,
                    minOrderQty: p.min_order_qty ? `${p.min_order_qty} ${p.unit}` : null,
                    certifications: p.certifications,
                }))

            return {
                companyName: supplier.company_name,
                country: supplier.country,
                description: supplier.description,
                certifications: supplier.certifications,
                verified: supplier.verified,
                website: supplier.website,
                products: supplierProducts,
            }
        })

        return {
            message: `Found ${results.length} supplier(s) with ${products.length} product(s).`,
            results,
        }
    },
})

/**
 * Product Lookup Tool
 * Search for specific pharmaceutical products by name, category, or HS code.
 */
export const productLookupTool = tool({
    description: 'Look up specific pharmaceutical products available on PharmConnect by name, category, or HS code. Use this when the user asks about specific drugs, active pharmaceutical ingredients, or wants to find products by HS/tariff code.',
    inputSchema: z.object({
        name: z.string().optional().describe('Product name to search for'),
        category: z.string().optional().describe('Product category'),
        hsCode: z.string().optional().describe('HS code / tariff code to look up'),
    }),
    execute: async ({ name, category, hsCode }) => {
        const products = await sql`
            SELECT
                p.id, p.name, p.description, p.hs_code, p.category,
                p.min_order_qty, p.unit, p.certifications,
                p.supplier_id,
                s.company_name AS supplier_name,
                s.verified     AS supplier_verified,
                s.certifications AS supplier_certifications
            FROM products p
            JOIN suppliers s ON s.id = p.supplier_id
            WHERE
                (${name ?? null} IS NULL OR p.name ILIKE ${'%' + (name ?? '') + '%'})
                AND (${category ?? null} IS NULL OR p.category ILIKE ${'%' + (category ?? '') + '%'})
                AND (${hsCode ?? null} IS NULL OR p.hs_code ILIKE ${'%' + (hsCode ?? '') + '%'})
            LIMIT 15
        `

        if (products.length === 0) {
            return { message: 'No products found matching your criteria.', results: [] }
        }

        const results = products.map((p) => ({
            name: p.name,
            description: p.description,
            category: p.category,
            hsCode: p.hs_code,
            minOrderQty: p.min_order_qty ? `${p.min_order_qty} ${p.unit}` : null,
            certifications: p.certifications,
            supplier: {
                name: p.supplier_name,
                verified: p.supplier_verified,
                certifications: p.supplier_certifications,
            },
        }))

        return {
            message: `Found ${results.length} product(s).`,
            results,
        }
    },
})

