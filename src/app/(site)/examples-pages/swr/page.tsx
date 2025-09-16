import { SWRExample } from '@/components/examples/swr-example'

export const metadata = {
  title: 'SWR Implementation Demo',
  description: 'Comprehensive demonstration of SWR server state management with caching, revalidation, and optimistic updates in Thorbis Business OS',
}

export default function SWRExamplePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SWRExample />
    </div>
  )
}