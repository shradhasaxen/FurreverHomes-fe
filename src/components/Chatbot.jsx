import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { assistantApi } from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Chatbot.module.css'

// Action → route mapping
const ACTION_ROUTES = {
  REDIRECT_LOGIN: ['/login', 'Sign In'],
  REDIRECT_MY_PETS: ['/dashboard/my-pets', 'Manage My Pets'],
  REDIRECT_GROOMING: ['/grooming', 'Book Grooming'],
  REDIRECT_BOARDING: ['/pet-house', 'Book Pet House'],
  REDIRECT_ADOPT: ['/adopt', 'Browse Pets'],
  REDIRECT_SHOP: ['/shopping', 'Go to Shop'],
  REDIRECT_DASHBOARD: ['/dashboard', 'My Dashboard'],
  REDIRECT_ORDERS: ['/dashboard/orders', 'View Orders'],
  REDIRECT_BOOKINGS: ['/dashboard/bookings', 'View Bookings'],
  REDIRECT_ADD_PET: ['/add-pet', 'Add Pet Listing'],
  REDIRECT_GROOMING_PAGE: ['/grooming', 'Book Grooming'],
  REDIRECT_BOARDING_PAGE: ['/pet-house', 'Book Pet House'],
  REDIRECT_ADOPT_PAGE: ['/adopt', 'Browse Pets'],
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! 🐾 I'm **Paws**, your FurrEver Homes AI assistant.\n\nHow can I help you today?",
      quickReplies: ['Book grooming', 'My orders', 'Adopt a pet', 'Contact support'],
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)
  const sessionId = useRef(crypto.randomUUID())
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Personalise greeting when user logs in
  useEffect(() => {
    if (user && open) {
      setMessages(m => {
        if (m.some(msg => msg._greeted)) return m
        return [...m, {
          from: 'bot',
          text: `Welcome back, **${user.name?.split(' ')[0]}**! 🐾 How can I help you today?`,
          _greeted: true,
          quickReplies: ['Book grooming', 'My orders', 'My bookings', 'My pets'],
        }]
      })
    }
  }, [user, open])

  async function send(text) {
    const trimmed = (text || input).trim()
    if (!trimmed) return
    setMessages(m => [...m, { from: 'user', text: trimmed }])
    setInput('')
    setTyping(true)

    try {
      const data = await assistantApi.chat(trimmed, sessionId.current)
      setTyping(false)

      const msg = { from: 'bot', text: data?.message || "I'm not sure about that. Try asking about bookings, pets, or orders!" }

      // Map action to a CTA button
      if (data?.action) {
        if (data.action === 'NAVIGATE' && data.payload?.path) {
          msg.action = { label: 'Go there →', route: data.payload.path }
        } else if (ACTION_ROUTES[data.action]) {
          const [route, label] = ACTION_ROUTES[data.action]
          msg.action = { label, route }
        }
      }

      // Show pet chips if payload has pets
      if (data?.payload?.pets?.length) {
        msg.petChips = data.payload.pets
      }

      if (data?.action === 'SHOW_HELPLINE' || data?.helpline) {
        msg.helpline = true
      }

      setMessages(m => [...m, msg])
    } catch {
      setTyping(false)
      setMessages(m => [...m, {
        from: 'bot',
        text: "I'm having trouble connecting right now. Please try again in a moment! 🐾",
      }])
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const HELPLINE = '+91-XXXXXXXXXX'

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.window}
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.avatar}>🐾</div>
                <div>
                  <div className={styles.botName}>Paws</div>
                  <div className={styles.botStatus}>
                    <span className={styles.onlineDot} /> AI Assistant · Online
                  </div>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={styles.msgGroup}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`${styles.bubble} ${msg.from === 'user' ? styles.userBubble : styles.botBubble}`}
                    dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                  />

                  {/* Pet chips */}
                  {msg.petChips?.length > 0 && (
                    <div className={styles.petChips}>
                      {msg.petChips.map(pet => (
                        <span key={pet.id} className={styles.petChip}>
                          {pet.type === 'DOG' ? '🐕' : pet.type === 'CAT' ? '🐈' : '🐾'} {pet.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action CTA */}
                  {msg.action && (
                    <motion.button
                      className={styles.actionBtn}
                      onClick={() => { navigate(msg.action.route); setOpen(false) }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      {msg.action.label} →
                    </motion.button>
                  )}

                  {/* Helpline */}
                  {msg.helpline && (
                    <div className={styles.helplineBox}>
                      <i className="fas fa-phone-alt" />
                      <span>Helpline:</span>
                      <a href={`tel:${HELPLINE}`} className={styles.helplineNum}>{HELPLINE}</a>
                    </div>
                  )}

                  {/* Quick replies */}
                  {msg.quickReplies && (
                    <div className={styles.quickReplies}>
                      {msg.quickReplies.map(qr => (
                        <button key={qr} className={styles.quickReply} onClick={() => send(qr)}>
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {typing && (
                <div className={`${styles.bubble} ${styles.botBubble} ${styles.typingBubble}`}>
                  <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything..."
                maxLength={300}
              />
              <motion.button
                className={styles.sendBtn}
                onClick={() => send()}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                aria-label="Send"
              >
                <i className="fas fa-paper-plane" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        className={styles.fab}
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.i key="x" className="fas fa-times" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.16 }} />
            : <motion.i key="chat" className="fas fa-comment-dots" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.16 }} />
          }
        </AnimatePresence>
        {!open && <span className={styles.pulse} />}
      </motion.button>
    </>
  )
}
