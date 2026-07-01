'use client'
import { use, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Heart, MessageSquare, Send, ArrowLeft, Pin, Lock, Trash2, CornerDownRight } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface Props { params: Promise<{ slug: string }> }

function CommentItem({ comment, user, onReply, onDelete, onLike, depth = 0 }: any) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.like_count || 0)

  const handleLike = async () => {
    if (!user) { toast.error('Pre lajkovanie sa musíte prihlásiť'); return }
    await onLike(comment.id, liked)
    setLiked(!liked)
    setLikeCount((c: number) => liked ? c - 1 : c + 1)
  }

  if (comment.is_deleted) return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-pink-100 pl-4' : ''}`}>
      <p className="text-sm text-gray-300 italic py-2">Komentár bol vymazaný</p>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      className={depth > 0 ? 'ml-8 border-l-2 border-pink-100 pl-4' : ''}
    >
      <div className="bg-white rounded-2xl border border-pink-50 shadow-soft p-4 mb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-9 h-9 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
              {(comment.profiles?.first_name?.[0] || comment.user_email?.[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-gray-800">
                  {comment.profiles?.first_name ? `${comment.profiles.first_name} ${comment.profiles.last_name}` : 'Používateľ'}
                </span>
                <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
            </div>
          </div>
          {user && comment.user_id === user.id && (
            <button onClick={() => onDelete(comment.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-pink-50">
          <button onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? 'text-[#C2185B]' : 'text-gray-400 hover:text-[#C2185B]'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} /> {likeCount}
          </button>
          {depth < 2 && (
            <button onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#C2185B] transition-colors"
            >
              <CornerDownRight className="w-3.5 h-3.5" /> Odpovedať
            </button>
          )}
        </div>

        {/* Reply form */}
        <AnimatePresence>
          {showReply && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 flex gap-2">
                <input value={replyText} onChange={e => setReplyText(e.target.value)}
                  placeholder="Napíšte odpoveď..."
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] text-sm"
                  onKeyDown={e => { if (e.key === 'Enter' && replyText.trim()) { onReply(comment.id, replyText); setReplyText(''); setShowReply(false) } }}
                />
                <button onClick={() => { if (replyText.trim()) { onReply(comment.id, replyText); setReplyText(''); setShowReply(false) } }}
                  className="p-2 bg-[#C2185B] text-white rounded-xl hover:bg-[#880E4F] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Replies */}
      {comment.replies?.map((reply: any) => (
        <CommentItem key={reply.id} comment={reply} user={user} onReply={onReply} onDelete={onDelete} onLike={onLike} depth={depth + 1} />
      ))}
    </motion.div>
  )
}

export default function ForumPostPage({ params }: Props) {
  const { slug } = use(params)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    const { data: p } = await supabase
      .from('forum_posts')
      .select('*, category:forum_categories(name,slug,icon,color)')
      .eq('slug', slug)
      .single()

    if (!p) { setLoading(false); return }
    setPost(p)
    setLikeCount(p.like_count || 0)

    // Increment view count
    await supabase.from('forum_posts').update({ view_count: (p.view_count || 0) + 1 }).eq('id', p.id)

    // Check if user liked
    if (user) {
      const { data: like } = await supabase.from('forum_likes').select('id').eq('post_id', p.id).eq('user_id', user.id).single()
      setLiked(!!like)
    }

    // Load comments with profiles
    const { data: rawComments } = await supabase
      .from('forum_comments')
      .select('*, profiles(first_name, last_name)')
      .eq('post_id', p.id)
      .is('parent_id', null)
      .order('created_at')

    // Load replies
    const commentIds = (rawComments || []).map((c: any) => c.id)
    let replies: any[] = []
    if (commentIds.length) {
      const { data: r } = await supabase
        .from('forum_comments')
        .select('*, profiles(first_name, last_name)')
        .in('parent_id', commentIds)
        .order('created_at')
      replies = r || []
    }

    const commentsWithReplies = (rawComments || []).map((c: any) => ({
      ...c,
      replies: replies.filter((r: any) => r.parent_id === c.id),
    }))

    setComments(commentsWithReplies)
    setLoading(false)
  }

  useEffect(() => { load() }, [slug])

  const handleLikePost = async () => {
    if (!user) { toast.error('Pre lajkovanie sa musíte prihlásiť'); return }
    const supabase = createClient()
    if (liked) {
      await supabase.from('forum_likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      await supabase.from('forum_posts').update({ like_count: likeCount - 1 }).eq('id', post.id)
      setLikeCount(c => c - 1)
    } else {
      await supabase.from('forum_likes').insert({ post_id: post.id, user_id: user.id })
      await supabase.from('forum_posts').update({ like_count: likeCount + 1 }).eq('id', post.id)
      setLikeCount(c => c + 1)
    }
    setLiked(!liked)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { toast.error('Pre komentovanie sa musíte prihlásiť'); return }
    if (!newComment.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    await supabase.from('forum_comments').insert({ post_id: post.id, user_id: user.id, content: newComment.trim() })
    await supabase.from('forum_posts').update({ comment_count: (post.comment_count || 0) + 1 }).eq('id', post.id)
    setNewComment('')
    toast.success('Komentár pridaný!')
    load()
    setSubmitting(false)
  }

  const handleReply = async (parentId: string, content: string) => {
    if (!user) { toast.error('Pre odpoveď sa musíte prihlásiť'); return }
    const supabase = createClient()
    await supabase.from('forum_comments').insert({ post_id: post.id, parent_id: parentId, user_id: user.id, content })
    await supabase.from('forum_posts').update({ comment_count: (post.comment_count || 0) + 1 }).eq('id', post.id)
    toast.success('Odpoveď pridaná!')
    load()
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Vymazať komentár?')) return
    const supabase = createClient()
    await supabase.from('forum_comments').update({ is_deleted: true, content: '' }).eq('id', commentId)
    toast.success('Komentár vymazaný')
    load()
  }

  const handleCommentLike = async (commentId: string, isLiked: boolean) => {
    if (!user) { toast.error('Pre lajkovanie sa musíte prihlásiť'); return }
    const supabase = createClient()
    if (isLiked) {
      await supabase.from('forum_comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id)
    } else {
      await supabase.from('forum_comment_likes').insert({ comment_id: commentId, user_id: user.id })
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <div className="h-8 w-48 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-64 bg-white rounded-3xl animate-pulse" />
    </div>
  )

  if (!post) return (
    <div className="text-center py-32 text-gray-400">
      <p className="text-xl font-medium">Príspevok nenájdený</p>
      <Link href="/forum" className="text-[#C2185B] hover:underline mt-2 block">Späť na fórum</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back */}
      <Link href="/forum" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#C2185B] transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Späť na fórum
      </Link>

      {/* Post */}
      <article className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
        {/* Category bar */}
        {post.category && (
          <div className="px-8 pt-6 pb-0">
            <span className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: (post.category.color || '#C2185B') + '20', color: post.category.color || '#C2185B' }}
            >
              {post.category.icon} {post.category.name}
            </span>
          </div>
        )}

        <div className="p-8">
          {/* Title */}
          <div className="flex items-start gap-3 mb-4">
            {post.is_pinned && <Pin className="w-5 h-5 text-[#C2185B] shrink-0 mt-1" />}
            <h1 className="text-2xl font-bold text-[#880E4F] leading-tight">{post.title}</h1>
          </div>

          <p className="text-sm text-gray-400 mb-6">{formatDate(post.created_at)}</p>

          {/* Content */}
          <div className="prose prose-pink max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Images */}
          {post.images?.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {post.images.map((img: string, i: number) => (
                <div key={i} className="rounded-2xl overflow-hidden aspect-video bg-[#FFF0F7]">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-pink-100">
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleLikePost}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                liked ? 'bg-[#FFF0F7] text-[#C2185B]' : 'bg-gray-50 text-gray-500 hover:bg-[#FFF0F7] hover:text-[#C2185B]'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {likeCount} {likeCount === 1 ? 'lajk' : 'lajkov'}
            </motion.button>
            <span className="flex items-center gap-2 text-sm text-gray-400">
              <MessageSquare className="w-4 h-4" /> {post.comment_count} komentárov
            </span>
            {!post.allow_comments && (
              <span className="flex items-center gap-1.5 text-sm text-gray-400 ml-auto">
                <Lock className="w-4 h-4" /> Komentáre vypnuté
              </span>
            )}
          </div>
        </div>
      </article>

      {/* Comments */}
      {post.allow_comments && (
        <div className="space-y-4">
          <h2 className="font-bold text-[#880E4F] text-lg">Komentáre ({comments.length})</h2>

          {/* New comment form */}
          {user ? (
            <form onSubmit={handleComment} className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5">
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {(user.user_metadata?.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 flex gap-2">
                  <input value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder="Napíšte komentár..."
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 text-sm"
                  />
                  <button type="submit" disabled={submitting || !newComment.trim()}
                    className="px-4 py-2.5 bg-[#C2185B] text-white rounded-2xl hover:bg-[#880E4F] transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? '...' : 'Odoslať'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-[#FFF0F7] rounded-3xl p-5 text-center border border-pink-100">
              <p className="text-gray-600 text-sm mb-3">Pre komentovanie sa musíte prihlásiť</p>
              <Link href="/auth/login?redirect=/forum" className="inline-block bg-[#C2185B] text-white px-6 py-2.5 rounded-2xl font-medium text-sm hover:bg-[#880E4F] transition-colors">
                Prihlásiť sa
              </Link>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                Zatiaľ žiadne komentáre. Buďte prvý! 💬
              </div>
            ) : (
              comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} user={user}
                  onReply={handleReply} onDelete={handleDeleteComment} onLike={handleCommentLike}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
