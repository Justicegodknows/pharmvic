import { redirect } from 'next/navigation'
import type { ReactElement } from 'react'

export default function DashboardChatPage(): ReactElement {
    redirect('/agent-chat')
}
