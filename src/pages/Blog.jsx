import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../components/Footer'
import { blogApi, auth } from '../api'
import styles from './Blog.module.css'

const SAMPLE_POSTS = [
  { authorName: 'Priya S.', createdAt: null, title: 'My Golden Retriever Journey', content: 'Adopting Bruno was the best decision of my life. He brings so much joy every single day. From morning walks to evening cuddles, every moment is precious. If you\'re thinking about adopting, just do it!' },
  { authorName: 'Rahul M.', createdAt: null, title: 'Life with Two Cats', content: 'When I adopted Luna and Stella, I had no idea how much they would change my life. They are the most independent yet loving creatures. Watching them play together is pure therapy.' },
  { authorName: 'Ananya K.', createdAt: null, title: 'My Parrot Speaks!', content: 'My budgie Mango started saying "hello" after just two weeks! Birds are incredibly intelligent. FurrEver Homes made the adoption process so smooth and easy.' },
]

export default function Blog() {
  const [posts, setPosts] = useState(SAMPLE_POSTS)
  const [showPopup, setShowPopup] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    blogApi.fetchAll()
      .then(res => {
        const list = res?.data?.content ?? res?.data ?? []
        if (list.length) setPosts(p => [...list, ...p])
      })
      .catch(() => {})
  }, [])

  function set(f, v) { setForm(x => ({ ...x, [f]: v })); setErrors(e => ({ ...e, [f]: '' })) }

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Required'
    if (!form.content.trim()) e.content = 'Required'
    return e
  }

  function handleWriteClick() {
    if (!auth.isLoggedIn()) { navigate('/signup'); return }
    setShowPopup(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await blogApi.submit({ blog: `${form.title}\n${form.content}` })
      const user = auth.getUser()
      setPosts(p => [{ authorName: user?.name || 'You', title: form.title, content: form.content }, ...p])
      setSuccess(true)
      setForm({ title: '', content: '' })
      setTimeout(() => { setSuccess(false); setShowPopup(false) }, 2000)
    } catch (err) {
      alert(err.message || 'Failed to post blog.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroBanner}>
        <img src="https://w0.peakpx.com/wallpaper/166/583/HD-wallpaper-laptop-dog-glasses.jpg" alt="Blog" className={styles.bannerImg} />
        <div className={styles.bannerOverlay} />
        <motion.h1 className={styles.bannerTitle} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Blog Page
        </motion.h1>
      </div>

      <motion.button
        className={styles.writeBtn}
        onClick={handleWriteClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        ✍️ Write Your Own Blog
      </motion.button>

      <div className={styles.grid}>
        {posts.map((post, i) => (
          <motion.div
            key={i}
            className={styles.card}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(61,64,91,0.14)' }}
          >
            <h3 className={styles.postTitle}>{post.title}</h3>
            <p className={styles.postBody}>
              {expanded === i ? post.content : post.content?.slice(0, 160) + (post.content?.length > 160 ? '...' : '')}
            </p>
            {post.content?.length > 160 && (
              <button className={styles.readMore} onClick={() => setExpanded(expanded === i ? null : i)}>
                {expanded === i ? 'Read less' : 'Read more'}
              </button>
            )}
            <p className={styles.author}>— {post.authorName}</p>
          </motion.div>
        ))}
      </div>

      <Footer />

      <AnimatePresence>
        {showPopup && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              className={styles.popup}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button className={styles.closePopup} onClick={() => setShowPopup(false)}>×</button>
              <h2 className={styles.popupTitle}>Write Your Own Blog</h2>
              {success ? (
                <motion.div className={styles.successMsg} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  🎉 Blog posted successfully!
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className={styles.field}>
                    <input
                      className={`${styles.input} ${errors.title ? styles.inputErr : ''}`}
                      placeholder="Blog Title"
                      value={form.title}
                      onChange={e => set('title', e.target.value)}
                    />
                    {errors.title && <span className={styles.err}>{errors.title}</span>}
                  </div>
                  <div className={styles.field}>
                    <textarea
                      className={`${styles.input} ${styles.textarea} ${errors.content ? styles.inputErr : ''}`}
                      placeholder="Write your blog content here..."
                      rows={5}
                      value={form.content}
                      onChange={e => set('content', e.target.value)}
                    />
                    {errors.content && <span className={styles.err}>{errors.content}</span>}
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Posting...' : 'Submit Blog'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
