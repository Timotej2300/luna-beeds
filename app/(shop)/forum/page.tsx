import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { MessageSquare, Heart, Eye, Pin, Lock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Fórum' }

export default async function ForumPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: posts }] = await Promise.all([
    supabase.from('forum_categories').select('*').eq('is_active', true).order('position'),
    supabase.from('forum_posts')
      .select('*, category:forum_categories(name,slug,icon,color)')
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[#880E4F] mb-2">Fórum</h1>
        <p className="text-gray-500">Novinky, inšpirácie a komunita Luna&Beeds</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar - categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5 sticky top-24">
            <h2 className="font-bold text-[#880E4F] mb-4 text-sm uppercase tracking-wider">Kategórie</h2>
            <div className="space-y-1">
              <Link href="/forum" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FFF0F7] text-[#C2185B] font-medium text-sm">
                <span>🗂️</span> Všetky príspevky
                <span className="ml-auto text-xs bg-[#FFB6D9]/40 px-2 py-0.5 rounded-full">{posts?.length || 0}</span>
              </Link>
              {categories?.map((cat: any) => (
                <Link key={cat.id} href={`/forum?category=${cat.slug}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-[#FFF0F7] hover:text-[#C2185B] transition-colors text-sm"
                >
                  <span>{cat.icon}</span>
                  <span className="flex-1 truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="lg:col-span-3 space-y-4">
          {!posts?.length ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-pink-50 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-[#FFB6D9]" />
              <p>Zatiaľ žiadne príspevky</p>
            </div>
          ) : posts.map((post: any) => (
            <Link key={post.id} href={`/forum/${post.slug}`}
              className="block bg-white rounded-3xl shadow-soft border border-pink-50 p-6 hover:border-[#FFB6D9] hover:shadow-card transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Category icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: (post.category?.color || '#C2185B') + '20' }}
                >
                  {post.category?.icon || '💬'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {post.is_pinned && (
                      <span className="flex items-center gap-1 text-xs text-[#C2185B] font-medium">
                        <Pin className="w-3 h-3" /> Pripnuté
                      </span>
                    )}
                    {post.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: (post.category.color || '#C2185B') + '20', color: post.category.color || '#C2185B' }}
                      >
                        {post.category.name}
                      </span>
                    )}
                    {!post.allow_comments && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Lock className="w-3 h-3" /> Komentáre vypnuté
                      </span>
                    )}
                  </div>

                  <h2 className="font-bold text-gray-800 text-lg group-hover:text-[#C2185B] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.content.replace(/<[^>]*>/g, '').slice(0, 150)}...</p>

                  {/* Images preview */}
                  {post.images?.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {post.images.slice(0, 3).map((img: string, i: number) => (
                        <div key={i} className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFF0F7] relative shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {post.images.length > 3 && (
                        <div className="w-16 h-16 rounded-xl bg-[#FFF0F7] flex items-center justify-center text-sm text-gray-400 font-medium">
                          +{post.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> {post.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> {post.comment_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {post.view_count}
                    </span>
                    <span className="ml-auto">{formatDate(post.created_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
