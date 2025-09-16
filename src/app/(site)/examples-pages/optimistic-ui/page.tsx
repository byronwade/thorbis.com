import { OptimisticUIDemo } from '@/components/examples/optimistic-ui-demo'

export const metadata = {
  title: 'Optimistic UI Patterns Demo',
  description: 'Comprehensive demonstration of optimistic UI patterns for immediate feedback and better user experience in Thorbis Business OS',
}

export default function OptimisticUIPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <OptimisticUIDemo />
    </div>
  )
}