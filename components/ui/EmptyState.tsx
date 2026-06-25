import Link from 'next/link'

interface Props {
  icon?: string
  title: string
  description?: string
  action?: { label: string; href?: string; onClick?: () => void }
}

export default function EmptyState({ icon = '📦', title, description, action }: Props) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-lg font-medium text-gray-700 mb-1">{title}</p>
      {description && <p className="text-sm text-gray-400 mb-6">{description}</p>}
      {action && (action.href
        ? <Link href={action.href} className="inline-block bg-[#C2185B] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors shadow-soft">{action.label}</Link>
        : <button onClick={action.onClick} className="bg-[#C2185B] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors shadow-soft">{action.label}</button>
      )}
    </div>
  )
}
