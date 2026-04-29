import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { assistantApi } from '../api'
import styles from './Chatbot.module.css'

const HELPLINE = '+91-XXXXXXXXXX'

const ROUTES = {
  home: '/',
  adopt: '/adopt',
  'adopt pet': '/adopt',
  'available pets': '/adopt',
  'add pet': '/add-pet',
  'list pet': '/add-pet',
  signup: '/signup',
  'sign up': '/signup',
  login: '/signup',
  'sign in': '/signup',
  blog: '/blog',
  shopping: '/shopping',
  shop: '/shopping',
  grooming: '/grooming',
  groom: '/grooming',
  'pet house': '/pet-house',
  boarding: '/pet-house',
  payment: '/payment',
  'book pet': '/book-pet',
  booking: '/book-pet',
}

// Knowledge base with intent patterns
const KB = [
  {
    patterns: ['hello', 'hi', 'hey', 'namaste', 'start', 'help'],
    response: { text: "Hello! 🐾 I'm **Paws**, your FurrEver Homes AI assistant.\n\nI can help you with:\n• Pet adoption & listing\n• Grooming & boarding\n• Shopping & orders\n• Booking appointments\n• Platform navigation\n\nWhat would you like to do today?" },
  },
  {
    patterns: ['adopt', 'adoption', 'how to adopt', 'get a pet', 'find a pet'],
    response: {
      text: "Great choice! 🐶 Here's how to adopt:\n1. Browse available pets\n2. Click **Details** to learn more\n3. Click **Get Pet** to book\n4. We'll contact you within 24–48 hrs",
      action: { label: 'Browse Available Pets', route: '/adopt' },
    },
  },
  {
    patterns: ['add pet', 'list pet', 'give pet', 'surrender', 'rehome', 'put up for adoption'],
    response: {
      text: "Want to find a loving home for your pet? 🐱\nFill in your pet's details and we'll list them for adoption or sale.",
      action: { label: 'Add Your Pet', route: '/add-pet' },
    },
  },
  {
    patterns: ['book', 'booking', 'appointment', 'schedule', 'book a slot', 'book slot'],
    response: {
      text: "I'll help you book a pet! 📅\nPlease fill in your details on the booking page and our team will confirm your appointment.",
      action: { label: 'Book a Pet', route: '/book-pet' },
    },
  },
  {
    patterns: ['groom', 'grooming', 'bath', 'haircut', 'spa', 'grooming service'],
    response: {
      text: "Our professional grooming service is available at your doorstep! 🛁\nFill in your pet's details and we'll schedule a session.",
      action: { label: 'Book Grooming', route: '/grooming' },
    },
  },
  {
    patterns: ['pet house', 'boarding', 'hostel', 'shelter', 'stay', 'travel', 'going out of town'],
    response: {
      text: "Going on a trip? 🏠 Your pet will be in safe hands!\nFill in the duration and we'll confirm availability.",
      action: { label: 'Book Pet House', route: '/pet-house' },
    },
  },
  {
    patterns: ['shop', 'shopping', 'buy', 'products', 'accessories', 'food', 'toys', 'store'],
    response: {
      text: "Our shop has everything your pet needs! 🛒\n• Pawtastic Accessories\n• NutriPaws Food\n• Pawsome Toys\n• FluffCare Grooming\n• Paw Pages Books",
      action: { label: 'Go to Shop', route: '/shopping' },
    },
  },
  {
    patterns: ['blog', 'write', 'post', 'story', 'share experience'],
    response: {
      text: "Love sharing pet stories? 📝 Our community blog is the perfect place!\nClick **Write Your Own Blog** to share your experience.",
      action: { label: 'Visit Blog', route: '/blog' },
    },
  },
  {
    patterns: ['sign up', 'register', 'create account', 'login', 'sign in', 'account'],
    response: {
      text: "Create an account or sign in to manage your listings and adoption requests. 🔐",
      action: { label: 'Sign Up / Sign In', route: '/signup' },
    },
  },
  {
    patterns: ['payment', 'pay', 'checkout', 'order', 'buy now'],
    response: {
      text: "Payments are processed securely on our checkout page. 💳\nWe accept all major debit/credit cards.",
      action: { label: 'Go to Payment', route: '/payment' },
    },
  },
  {
    patterns: ['vaccination', 'vaccine', 'health', 'vet', 'medical', 'checkup'],
    response: { text: "All pets on FurrEver Homes must have their vaccination status disclosed. 💉\nWe recommend a vet visit within the first week of adoption for a full health checkup." },
  },
  {
    patterns: ['injury', 'rescue', 'hurt', 'stray', 'emergency', 'accident'],
    response: { text: "🚨 **Emergency?** Call our rescue helpline immediately!", helpline: true },
  },
  {
    patterns: ['price', 'cost', 'fee', 'charge', 'free', 'how much'],
    response: { text: "Adoption is often free or at a nominal fee set by the owner. 💰\nPets listed **For Sale** show their price. Grooming & boarding fees are shared after booking confirmation." },
  },
  {
    patterns: ['dog', 'puppy', 'pup', 'labrador', 'golden retriever'],
    response: {
      text: "We have adorable dogs and puppies waiting for a loving home! 🐕",
      action: { label: 'See Available Dogs', route: '/adopt' },
    },
  },
  {
    patterns: ['cat', 'kitten', 'kitty', 'feline'],
    response: {
      text: "Looking for a feline friend? 🐈 We have cats and kittens ready for adoption!",
      action: { label: 'See Available Cats', route: '/adopt' },
    },
  },
  {
    patterns: ['bird', 'parrot', 'budgie', 'cockatiel'],
    response: {
      text: "We have beautiful birds available too! 🦜",
      action: { label: 'See Available Birds', route: '/adopt' },
    },
  },
  {
    patterns: ['hamster', 'rabbit', 'guinea pig', 'other pet', 'small pet'],
    response: {
      text: "We also list small pets like hamsters and rabbits! 🐹",
      action: { label: 'See All Pets', route: '/adopt' },
    },
  },
  {
    patterns: ['contact', 'phone', 'call', 'helpline', 'support', 'reach you'],
    response: { text: "You can reach our support team directly:", helpline: true },
  },
  {
    patterns: ['thank', 'thanks', 'bye', 'goodbye', 'ok', 'great'],
    response: { text: "You're welcome! 🐾 Happy pet parenting!\nFeel free to ask anything anytime.", helpline: true },
  },
  {
    patterns: ['process', 'how does it work', 'steps', 'procedure'],
    response: {
      text: "Here's how FurrEver Homes works:\n1. **Browse** available pets\n2. **Contact** the owner or click Get Pet\n3. **Book** your appointment\n4. **Complete** the adoption process\n5. **Welcome** your new family member! 🎉",
      action: { label: 'Start Browsing', route: '/adopt' },
    },
  },
]

function getBotResponse(input) {
  const lower = input.toLowerCase().trim()

  // Check for direct navigation intent
  for (const [keyword, route] of Object.entries(ROUTES)) {
    if (lower.includes(`go to ${keyword}`) || lower.includes(`open ${keyword}`) || lower.includes(`take me to ${keyword}`) || lower.includes(`navigate to ${keyword}`)) {
      return {
        text: `Sure! Taking you to the **${keyword}** page right away.`,
        navigate: route,
      }
    }
  }

  // Match knowledge base
  for (const entry of KB) {
    if (entry.patterns.some(p => lower.includes(p))) {
      return entry.response
    }
  }

  return {
    text: "I'm not sure about that, but I'm here to help with pet adoption, grooming, boarding, shopping, and more! 🐾\n\nTry asking:\n• \"How do I adopt a pet?\"\n• \"Book grooming for my dog\"\n• \"Show me available pets\"",
    helpline: true,
  }
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
      text: "Hi there! 🐾 I'm **Paws**, your FurrEver Homes AI assistant.\n\nHow can I help you today?",
      quickReplies: ['How to adopt?', 'Book grooming', 'Available pets', 'Contact support'],
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function handleResponse(response) {
    const msg = { from: 'bot', text: response.text }
    if (response.action) msg.action = response.action
    if (response.helpline) msg.helpline = true
    setMessages(m => [...m, msg])

    // Auto-navigate if intent detected
    if (response.navigate) {
      setTimeout(() => navigate(response.navigate), 800)
    }
  }

  const sessionId = useRef(crypto.randomUUID())

  async function send(text) {
    const trimmed = (text || input).trim()
    if (!trimmed) return
    setMessages(m => [...m, { from: 'user', text: trimmed }])
    setInput('')
    setTyping(true)
    try {
      const res = await assistantApi.chat(trimmed, sessionId.current)
      const data = res?.data ?? {}
      setTyping(false)
      const msg = { from: 'bot', text: data.message || '' }
      if (data.action === 'NAVIGATE' && data.payload?.path) {
        msg.action = { label: `Go to page`, route: data.payload.path }
      } else if (data.action === 'REDIRECT_LOGIN') {
        msg.action = { label: 'Sign In / Sign Up', route: '/signup' }
      } else if (data.action === 'REDIRECT_ADD_PET') {
        msg.action = { label: 'Add Your Pet', route: '/add-pet' }
      } else if (data.action === 'REDIRECT_ADOPT_PAGE') {
        msg.action = { label: 'Browse Pets', route: '/adopt' }
      } else if (data.action === 'REDIRECT_GROOMING_PAGE') {
        msg.action = { label: 'Book Grooming', route: '/grooming' }
      } else if (data.action === 'REDIRECT_BOARDING_PAGE') {
        msg.action = { label: 'Book Pet House', route: '/pet-house' }
      } else if (data.action === 'SHOW_BOOKING_FORM' && data.payload?.pets) {
        msg.action = { label: 'Go to Bookings', route: '/book-pet' }
      }
      if (data.helpline) msg.helpline = true
      setMessages(m => [...m, msg])
    } catch {
      // fallback to local KB if backend unavailable
      setTyping(false)
      handleResponse(getBotResponse(trimmed))
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

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
                  <div className={`${styles.bubble} ${msg.from === 'user' ? styles.userBubble : styles.botBubble}`}
                    dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                  />

                  {/* Action button */}
                  {msg.action && (
                    <motion.button
                      className={styles.actionBtn}
                      onClick={() => navigate(msg.action.route)}
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
                      <span>For more support, contact our helpline:</span>
                      <a href={`tel:${HELPLINE}`} className={styles.helplineNum}>{HELPLINE}</a>
                    </div>
                  )}

                  {/* Quick replies (first message only) */}
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
                placeholder="Type your message..."
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
