'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, slugify } from '@/lib/utils'
import { Plus, Pencil, Trash2, Eye, Heart, MessageSquare, Pin, Search } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const CATEGORIES_ICONS = ['📢','💎','🎉','💬','❓','🌸','⭐','🔥','💡','📸']
const COLORS = ['#C2185B','#880E4F','#FF5722','#9C27B0','#2196F3','#FF8EC7','#4CAF50','#FF9800']

export default function AdminForumPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'posts'|'categories'|'comments'>('posts')
  const [comments, setComments] = useState<any[]>([])
  const [search, setSearch] = useState('')

  const [postForm, setPostForm] = useState({
    title: '', slug: '', content: '', category_id: '',
    images: [] as string[], allow_comments: true, is_pinned: false, is_published: true,
  })
  const [catForm, setCatForm] = useState({
    name: '', slug: '', description: '', icon: '💬', color: '#C2185B', position: 0,
  })
  const [imageUrl, setImageUrl] = useState('')

  const load = async () => {
    const supabase = createClient()
    const [{ data: p }, { data: c }, { data: cm }] = await Promise.all([
      supabase.from('forum_posts').select('*, category:forum_categories(name,icon,color)').order('created_at', { ascending: false }),
      supabase.from('forum_categories').select('*').order('position'),
      supabase.from('forum_comments').select('*, profiles(first_name,last_name), post:forum_posts(title)').order('created_at', { ascending: false }).limit(50),
    ])
    setPosts(p || [])
    setCategories(c || [])
    setComments(cm || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNewPost = () => {
    setEditingPost(null)
    setPostForm({ title: '', slug: '', content: '', category_id: '', images: [], allow_comments: true, is_pinned: false, is_published: true })
    setPostModalOpen(true)
  }

  const openEditPost = (post: any) => {
    setEditingPost(post)
    setPostForm({ title: post.title, slug: post.slug, content: post.content, category_id: post.category_id || '', images: post.images || [], allow_comments: post.allow_comments, is_pinned: post.is_pinned, is_published: post.is_published })
    setPostModalOpen(true)
  }

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const data = { ...postForm, slug: postForm.slug || slugify(postForm.title), author_id: user?.id }
    const { error } = editingPost
      ? await supabase.from('forum_posts').update(data).eq('id', editingPost.id)
      : await supabase.from('forum_posts').insert(data)
    if (error) { toast.error(error.message); return }
    toast.success(editingPost ? 'Príspevok aktualizovaný!' : 'Príspevok vytvorený!')
    setPostModalOpen(false); load()
  }

  const deletePost = async (id: string) => {
    if (!confirm('Vymazať príspevok?')) return
    const supabase = createClient()
    await supabase.from('forum_posts').delete().eq('id', id)
    toast.success('Príspevok vymazaný'); load()
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Vymazať komentár?')) return
    const supabase = createClient()
    await supabase.from('forum_comments').update({ is_deleted: true, content: '' }).eq('id', id)
    toast.success('Komentár vymazaný'); load()
  }

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const data = { ...catForm, slug: catForm.slug || slugify(catForm.name) }
    const { error } = await supabase.from('forum_categories').insert(data)
    if (error) { toast.error(error.message); return }
    toast.success('Kategória pridaná!'); setCatModalOpen(false); load()
  }

  const addImage = () => {
    if (!imageUrl.trim()) return
    setPostForm(f => ({ ...f, images: [...f.images, imageUrl.trim()] }))
    setImageUrl('')
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20 text-sm'
  const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
  const filteredComments = comments.filter(c => !c.is_deleted && (c.content?.toLowerCase().includes(search.toLowerCase()) || c.profiles?.first_name?.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#880E4F]">Fórum</h1></div>
        <div className="flex gap-2">
          <button onClick={() => setCatModalOpen(true)}
            className="flex items-center gap-2 border border-[#C2185B] text-[#C2185B] px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-[#FFF0F7] transition-colors"
          ><Plus className="w-4 h-4" /> Kategória</button>
          <button onClick={openNewPost}
            className="flex items-center gap-2 bg-[#C2185B] text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors shadow-soft text-sm"
          ><Plus className="w-4 h-4" /> Nový príspevok</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[['posts','Príspevky'], ['categories','Kategórie'], ['comments','Komentáre']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveTab(val as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === val ? 'bg-[#C2185B] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-[#FFF0F7]'}`}
          >{label}</button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hľadať..."
          className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] shadow-soft text-sm"
        />
      </div>

      {/* Posts tab */}
      {activeTab === 'posts' && (
        <div className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[#FFF0F7]">
              {['Príspevok', 'Kategória', 'Štatistiky', 'Dátum', 'Stav', 'Akcie'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-pink-50">
              {loading ? [...Array(3)].map((_,i) => <tr key={i}>{[...Array(6)].map((_,j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded-xl animate-pulse" /></td>)}</tr>)
              : filteredPosts.map(post => (
                <tr key={post.id} className="hover:bg-[#FFF8FB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {post.is_pinned && <Pin className="w-4 h-4 text-[#C2185B] shrink-0" />}
                      <p className="font-medium text-gray-800 text-sm line-clamp-1">{post.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.category && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ backgroundColor: (post.category.color||'#C2185B')+'20', color: post.category.color||'#C2185B' }}
                      >{post.category.icon} {post.category.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.like_count}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comment_count}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.view_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(post.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {post.is_published ? 'Publikovaný' : 'Skrytý'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <a href={`/forum/${post.slug}`} target="_blank" className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#FFF0F7] hover:text-[#C2185B] transition-colors"><Eye className="w-4 h-4" /></a>
                      <button onClick={() => openEditPost(post)} className="p-2 rounded-xl bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deletePost(post.id)} className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: cat.color+'20' }}>{cat.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{cat.name}</p>
                <p className="text-xs text-gray-400 truncate">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments tab */}
      {activeTab === 'comments' && (
        <div className="space-y-3">
          {filteredComments.map(comment => (
            <motion.div key={comment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-800">
                    {comment.profiles?.first_name ? `${comment.profiles.first_name} ${comment.profiles.last_name}` : 'Používateľ'}
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{comment.content}</p>
                <p className="text-xs text-[#C2185B]">📄 {comment.post?.title}</p>
              </div>
              <button onClick={() => deleteComment(comment.id)}
                className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors shrink-0"
              ><Trash2 className="w-4 h-4" /></button>
            </motion.div>
          ))}
          {!filteredComments.length && <div className="text-center py-12 text-gray-400">Žiadne komentáre</div>}
        </div>
      )}

      {/* New/Edit Post Modal */}
      <Modal isOpen={postModalOpen} onClose={() => setPostModalOpen(false)} title={editingPost ? 'Upraviť príspevok' : 'Nový príspevok'} size="xl">
        <form onSubmit={savePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nadpis *</label>
            <input value={postForm.title} onChange={e => setPostForm(f => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))} required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input value={postForm.slug} onChange={e => setPostForm(f => ({ ...f, slug: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategória</label>
            <select value={postForm.category_id} onChange={e => setPostForm(f => ({ ...f, category_id: e.target.value }))} className={inputCls}>
              <option value="">-- bez kategórie --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Obsah *</label>
            <textarea value={postForm.content} onChange={e => setPostForm(f => ({ ...f, content: e.target.value }))} required rows={8} className={inputCls + ' resize-none'} placeholder="Napíšte obsah príspevku..." />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Obrázky (URL)</label>
            <div className="flex gap-2 mb-2">
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className={inputCls} />
              <button type="button" onClick={addImage} className="px-4 py-2 bg-[#FFF0F7] text-[#C2185B] rounded-xl text-sm font-medium hover:bg-[#FFB6D9]/30">Pridať</button>
            </div>
            {postForm.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {postForm.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded-xl" />
                    <button type="button" onClick={() => setPostForm(f => ({ ...f, images: f.images.filter((_,j) => j !== i) }))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-3 gap-4">
            {[['allow_comments','Povoliť komentáre'],['is_pinned','Pripnúť'],['is_published','Publikovať']].map(([k,l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(postForm as any)[k]} onChange={e => setPostForm(f => ({ ...f, [k]: e.target.checked }))} className="w-4 h-4 accent-[#C2185B]" />
                <span className="text-sm text-gray-700">{l}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setPostModalOpen(false)} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm">Zrušiť</button>
            <button type="submit" className="flex-1 py-2.5 rounded-2xl bg-[#C2185B] text-white text-sm font-semibold hover:bg-[#880E4F]">{editingPost ? 'Uložiť' : 'Vytvoriť'}</button>
          </div>
        </form>
      </Modal>

      {/* New Category Modal */}
      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title="Nová kategória">
        <form onSubmit={saveCat} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Názov *</label>
            <input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
            <input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ikona</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setCatForm(f => ({ ...f, icon: ic }))}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${catForm.icon === ic ? 'bg-[#FFF0F7] ring-2 ring-[#C2185B]' : 'bg-gray-50 hover:bg-[#FFF0F7]'}`}
                >{ic}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Farba</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setCatForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full ${catForm.color === c ? 'scale-125 ring-2 ring-offset-1' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setCatModalOpen(false)} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm">Zrušiť</button>
            <button type="submit" className="flex-1 py-2.5 rounded-2xl bg-[#C2185B] text-white text-sm font-semibold">Pridať</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
