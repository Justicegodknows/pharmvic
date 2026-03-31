import Link from 'next/link'
import type { ReactElement } from 'react'

export function Footer(): ReactElement {
    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <span className="text-sm font-bold text-primary-foreground">P</span>
                            </div>
                            <span className="text-lg font-bold">
                                Pharm<span className="text-primary">Connect</span>
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Connecting Nigerian pharmaceutical vendors with German manufacturers. Your trusted B2B pharma bridge.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold">Platform</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/marketplace" className="hover:text-foreground">Marketplace</Link></li>
                            <li><Link href="/agent-chat" className="hover:text-foreground">PharmAgent AI</Link></li>
                            <li><Link href="/auth/register" className="hover:text-foreground">Register</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold">Resources</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/regulatory-guide" className="hover:text-foreground">Regulatory Guide</Link></li>
                            <li><a href="https://nafdac.gov.ng" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">NAFDAC</a></li>
                            <li><a href="https://customs.gov.ng" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Nigerian Customs</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><span>Privacy Policy</span></li>
                            <li><span>Terms of Service</span></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-border pt-8 text-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} PharmConnect. All rights reserved.</p>
                    <p className="mt-1">
                        Informational platform only. Consult licensed professionals for regulatory advice.
                    </p>
                </div>
            </div>
        </footer>
    )
}
