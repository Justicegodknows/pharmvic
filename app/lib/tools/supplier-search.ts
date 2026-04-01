import { tool } from 'ai'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Supplier Search Tool
 * Queries the platform's supplier database for German pharmaceutical manufacturers.
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
        const supabase = createAdminClient()

        // Build supplier query
        let supplierQuery = supabase
            .from('suppliers')
            .select('id, company_name, description, certifications, verified, country, website')

        if (verifiedOnly !== false) {
            supplierQuery = supplierQuery.eq('verified', true)
        }

        if (query) {
            supplierQuery = supplierQuery.or(
                `company_name.ilike.%${query}%,description.ilike.%${query}%`
            )
        }

        if (certification) {
            supplierQuery = supplierQuery.contains('certifications', [certification])
        }

        const { data: suppliers, error: supplierError } = await supplierQuery
            .order('company_name')
            .limit(10)

        if (supplierError) {
            return { error: `Supplier search failed: ${supplierError.message}`, results: [] }
        }

        if (!suppliers || suppliers.length === 0) {
            return { message: 'No suppliers found matching your criteria.', results: [] }
        }

        // Fetch products for found suppliers
        const supplierIds = suppliers.map((s) => s.id)

        let productQuery = supabase
            .from('products')
            .select('id, supplier_id, name, description, hs_code, category, min_order_qty, unit, certifications')
            .in('supplier_id', supplierIds)

        if (category) {
            productQuery = productQuery.ilike('category', `%${category}%`)
        }

        if (query && !category) {
            productQuery = productQuery.or(
                `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
            )
        }

        const { data: products } = await productQuery.limit(30)

        // Compose results
        const results = suppliers.map((supplier) => {
            const supplierProducts = (products ?? [])
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
            message: `Found ${results.length} supplier(s) with ${(products ?? []).length} product(s).`,
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
        const supabase = createAdminClient()

        let query = supabase
            .from('products')
            .select('id, name, description, hs_code, category, min_order_qty, unit, certifications, supplier_id, suppliers:supplier_id(company_name, verified, certifications)')

        if (name) {
            query = query.ilike('name', `%${name}%`)
        }
        if (category) {
            query = query.ilike('category', `%${category}%`)
        }
        if (hsCode) {
            query = query.ilike('hs_code', `%${hsCode}%`)
        }

        const { data: products, error } = await query.limit(15)

        if (error) {
            return { error: `Product lookup failed: ${error.message}`, results: [] }
        }

        if (!products || products.length === 0) {
            return { message: 'No products found matching your criteria.', results: [] }
        }

        const results = products.map((p) => {
            const supplier = p.suppliers as unknown as {
                company_name: string
                verified: boolean
                certifications: string[]
            } | null

            return {
                name: p.name,
                description: p.description,
                category: p.category,
                hsCode: p.hs_code,
                minOrderQty: p.min_order_qty ? `${p.min_order_qty} ${p.unit}` : null,
                certifications: p.certifications,
                supplier: supplier ? {
                    name: supplier.company_name,
                    verified: supplier.verified,
                    certifications: supplier.certifications,
                } : null,
            }
        })

        return {
            message: `Found ${results.length} product(s).`,
            results,
        }
    },
})
