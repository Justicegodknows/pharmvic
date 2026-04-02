import Link from 'next/link'
import type { ReactElement } from 'react'

export function Footer(): ReactElement {
    return (
        <footer className="bg-[#F2F4F6]">
            <div className="mx-auto max-w-screen-2xl px-6 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <span className="text-xl font-bold tracking-tight font-headline text-[#000F22]">
                            PharmConnect
                        </span>
                        <p className="text-sm text-[#43474D]">
                            Connecting Nigerian pharmaceutical vendors with German manufacturers. Your trusted B2B pharma bridge.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h3 className="mb-3 font-headline text-sm font-bold text-[#000F22]">Platform</h3>
                        <ul className="space-y-2 text-sm text-[#43474D]">
                            <li><Link href="/marketplace" className="hover:text-[#006A6A] transition-colors">Marketplace</Link></li>
                            <li><Link href="/agent-chat" className="hover:text-[#006A6A] transition-colors">PharmAgent AI</Link></li>
                            <li><Link href="/auth/register" className="hover:text-[#006A6A] transition-colors">Register</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="mb-3 font-headline text-sm font-bold text-[#000F22]">Resources</h3>
                        <ul className="space-y-2 text-sm text-[#43474D]">
                            <li><Link href="/regulatory-guide" className="hover:text-[#006A6A] transition-colors">Regulatory Guide</Link></li>
                            <li><a href="https://nafdac.gov.ng" target="_blank" rel="noopener noreferrer" className="hover:text-[#006A6A] transition-colors">NAFDAC</a></li>
                            <li><a href="https://customs.gov.ng" target="_blank" rel="noopener noreferrer" className="hover:text-[#006A6A] transition-colors">Nigerian Customs</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="mb-3 font-headline text-sm font-bold text-[#000F22]">Legal</h3>
                        <ul className="space-y-2 text-sm text-[#43474D]">
                            <li><span>Privacy Policy</span></li>
                            <li><span>Terms of Service</span></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[#C4C6CE]/15 text-center text-xs text-[#43474D]">
                    <p>&copy; {new Date().getFullYear()} PharmConnect. All rights reserved.</p>
                    <p className="mt-1">
                        Informational platform only. Consult licensed professionals for regulatory advice.
                    </p>
                </div>
            </div>
        </footer>
    )
}
