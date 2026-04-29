import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../components/Footer'
import styles from './Shopping.module.css'

const SECTIONS = [
  {
    id: 'accessories',
    title: 'Pawtastic Accessories',
    bg: '#ffe5ec',
    products: [
      { name: 'Tuxedo Bandana', price: 289, original: 349, img: 'https://pawsindia.com/cdn/shop/files/2_-_Tuxedo_Bandana.png?v=1708200256' },
      { name: 'Green Reflective Collar & Leash', price: 169, img: 'https://pawsindia.com/cdn/shop/files/GREENREFLECTIVEtagcollarANDLEASH_360x.jpg?v=1712133748' },
      { name: 'Cat Chew Toy', price: 199, img: 'https://pawsindia.com/cdn/shop/products/1_51_360x.jpg?v=1655981020' },
      { name: 'Cat House', price: 299, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSraigV0St6UD-V5Nrrgs38kSTAjIHGENedPA&s' },
      { name: 'Rabbit House', price: 139, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-QmEzFyLUWx5drh4atjwzPYGH6z5rZ3CTig&s' },
      { name: 'Hamster Play', price: 129, original: 159, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUBbpU9vm_UXh4XqFBTQ7-dfCjIjN6YTm6-g&s' },
      { name: 'Food Bowl', price: 269, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7aTs5nK7wEOvpoEpkH2Z9jwDnGbidyJTw6w&s' },
      { name: 'Pet Harness', price: 399, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs079_c417ZOkwJbKEEUgp0LtNPLQWqYyPHA&s' },
      { name: 'Snuggle Buddy', price: 329, original: 529, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwrxvigsMtMo-2AZYRFCfag2SHNrU3ZUEm6A&s' },
    ],
  },
  {
    id: 'food',
    title: 'NutriPaws',
    bg: '#efd9ce',
    products: [
      { name: 'Grain Zero Nutri', price: 229, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjhVZIzmLqbsKF9sqj48qNUlI_yY1ZERTwCA&s' },
      { name: '4 Pack Cat Heaven', price: 209, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT03D1knCeg4N3OrIZaaxqJXkEByHPhJKG0w&s' },
      { name: 'Rabbit Food', price: 139, original: 239, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5wiWsq6qJoyyJNo6fVYksh-36613GiRNZ-Q&s' },
      { name: 'Organic Health Diet', price: 399, original: 699, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlxwiAp931yFizxBR0JBeZLE6v4Nee0QHOHQ&s' },
      { name: 'Temptations', price: 139, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTltMkwViytzHdlRuC4Px2vczcPO-oJLpgqeQ&s' },
      { name: 'Hamster Treats', price: 299, img: 'https://hopeshealthytreats.com/cdn/shop/products/Whimzee.jpg?v=1620664961&width=533' },
      { name: 'Little One', price: 159, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu-SJsEZvG2TIl6pZk94nohdc7Z0GifF9O4A&s' },
      { name: 'Menu Rabbit', price: 199, original: 299, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB2icetX4qHsI2Qb9QR6zco6gcdq7UGAURQA&s' },
      { name: 'Pet Star', price: 299, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWHF-RVRiO3BwbFGZKTTbfVq7opahX9kXmeA&s' },
    ],
  },
  {
    id: 'toys',
    title: 'Pawsome Toys',
    bg: '#ffe5ec',
    products: [
      { name: 'Squishy Balls (3)', price: 339, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP84fZMpvGBE_5NrfklSdElj3XKiPY3X1lgw&s' },
      { name: 'Wand Toy', price: 169, img: 'https://images-cdn.ubuy.co.in/633ae46fca2b591f76221f5f-meohui-cat-toys-2pcs-retractable-cat.jpg' },
      { name: 'CBC Life', price: 239, original: 439, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpC0rZy9vsLNuzNmGHanW1cO2WX6LaZ7H0aXGoe7fMMQ&s' },
      { name: 'Interaction Toggle', price: 189, img: 'https://img.kwcdn.com/product/fancy/b63b2c29-229a-4823-8f83-9155b754872e.jpg' },
      { name: 'Bone Pack of 6', price: 399, original: 699, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYTRL45BWUyGS4JoxuSGtyCmiX_zu-HpxkLA&s' },
      { name: 'Brain Boosters', price: 259, img: 'https://www.thesprucepets.com/thmb/BO_0FeixzneigdvBAAOEqzBBCTs=/6000x0/filters:no_upscale():strip_icc()/Best-Dog-Toys-for-Mental-Enrichment-tout-aec84b8e73f54367ad3cd8658ed3bbf7.jpg' },
      { name: 'Goofy Toyee', price: 199, original: 399, img: 'https://goofytails.com/cdn/shop/products/71k2naQuhvL._SX679_-min.jpg?v=1676125236' },
      { name: 'Play Treat', price: 399, img: 'https://m.media-amazon.com/images/I/71Y9BgtekKL.jpg' },
      { name: 'Ham Squeeshy', price: 259, img: 'https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/9ba0ad4aff61748ef2a4a7d79188ff74.jpg?imageMogr2/auto-orient%7CimageView2/2/w/800/q/70/format/webp' },
    ],
  },
  {
    id: 'groom',
    title: 'FluffCare',
    bg: '#efd9ce',
    products: [
      { name: 'Pet Care Combo', price: 499, original: 799, img: 'https://m.media-amazon.com/images/I/71XwWzk837L._AC_UF1000,1000_QL80_.jpg' },
      { name: 'Nose Balm', price: 60, img: 'https://thekindpet.com/cdn/shop/files/OrganicDogPawSalve_1080x.png?v=1695326767' },
      { name: 'Bath Essence', price: 239, img: 'https://www.poochmate.com/cdn/shop/files/PM-July22--76_1.jpg?v=1691660992&width=533' },
      { name: 'Purus Care', price: 299, img: 'https://www.puruspet.com/udata/image/Image/IMG_5451-11.JPG' },
      { name: 'Dental Kit', price: 229, original: 339, img: 'https://images.ctfassets.net/sfnkq8lmu5d7/2kYDtmz5cOc017ORI063OT/323865fc83c6658741bc8552d12c9542/2022-05-09_Eco-friendly_pet_grooming_products_oxyfresh-pet-dental-kits-value-size-try-me-kit_974d25f5-006f-41d9-900c-be34105.jpg?w=700&h=700&fl=progressive&q=70&fm=jpg' },
      { name: 'CareFur Kit', price: 150, img: 'https://m.media-amazon.com/images/I/81l2Y+tTRZL.jpg' },
      { name: 'Shampoo Care', price: 509, img: 'https://moderndogmagazine.com/sites/default/files/images/uploads/etveda.jpg' },
      { name: '5 in 1 Kit', price: 499, img: 'https://indihopshop.com/cdn/shop/products/GroomingKit4.jpg?v=1669982198' },
      { name: 'Furr Care', price: 200, original: 399, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNu9Qfxozxwo5wDmui6EezttYmZvqvAHrXrA&s' },
    ],
  },
  {
    id: 'books',
    title: 'Paw Pages',
    bg: '#ffe5ec',
    products: [
      { name: 'Big Dogs & Puppy', price: 229, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTixyjMYx7zUOGtuvRq4aw-fC7DMd9vLRWR3nSd8jWkTw&s' },
      { name: 'Know Your Bird', price: 269, img: 'https://m.media-amazon.com/images/I/81k8HN7AlML._AC_UF1000,1000_QL80_.jpg' },
      { name: 'Hamster Care', price: 199, original: 239, img: 'https://m.media-amazon.com/images/I/51l3yXKO5ZL.jpg' },
      { name: 'Hamisson', price: 380, img: 'https://m.media-amazon.com/images/I/81BLqIDJTQL._AC_UF1000,1000_QL80_.jpg' },
      { name: 'Hidden Languages of Catty', price: 158, original: 259, img: 'https://i0.wp.com/ecolitbooks.com/wp-content/uploads/2023/11/Cats_EcoLitBooks.png?resize=327%2C498&ssl=1' },
      { name: '4 in 1 Bookie', price: 590, img: 'https://assets.penguinrandomhouse.com/wp-content/uploads/2021/05/11100600/PRH_Backlist-Birding_1200x628-mobile-header.jpg' },
      { name: 'Know Your Cat', price: 250, img: 'https://m.media-amazon.com/images/I/51Zxye4qRnL._AC_UF894,1000_QL80_.jpg' },
      { name: 'Finches Dummies', price: 199, img: 'https://www.dummies.com/covers/9781119755319.jpg' },
      { name: '3 in 1 Combo', price: 159, original: 259, img: 'https://pamelakramercom.files.wordpress.com/2019/10/screen-shot-2019-10-31-at-9.12.59-pm.png' },
    ],
  },
]

export default function Shopping() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const navigate = useNavigate()

  function addToCart(product) {
    setCart(c => [...c, { ...product, cartId: Date.now() + Math.random() }])
  }

  function removeFromCart(cartId) {
    setCart(c => c.filter(i => i.cartId !== cartId))
  }

  const total = cart.reduce((sum, i) => sum + i.price, 0)

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {SECTIONS.map((section, si) => (
          <section key={section.id} className={styles.section} style={{ background: section.bg }}>
            <motion.h2
              className={styles.sectionTitle}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {section.title}
            </motion.h2>
            <div className={styles.productsGrid}>
              {section.products.map((product, pi) => (
                <motion.div
                  key={product.name}
                  className={styles.product}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: pi * 0.05, duration: 0.35 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.14)' }}
                >
                  <div className={styles.imgWrap}>
                    <img src={product.img} alt={product.name} className={styles.productImg} />
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.priceRow}>
                      {product.original && <s className={styles.originalPrice}>₹{product.original}</s>}
                      <span className={`${styles.price} ${product.original ? styles.discounted : ''}`}>₹{product.price}</span>
                    </div>
                    <motion.button
                      className={styles.addBtn}
                      onClick={() => addToCart(product)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer />

      {/* Cart FAB */}
      <motion.button
        className={styles.cartFab}
        onClick={() => setCartOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
      >
        <i className="fas fa-cart-shopping" />
        {cart.length > 0 && <span className={styles.cartBadge}>{cart.length}</span>}
      </motion.button>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              className={styles.cartBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            />
            <motion.aside
              className={styles.cartDrawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className={styles.cartHeader}>
                <h2 className={styles.cartTitle}>🛒 Cart ({cart.length})</h2>
                <button className={styles.cartClose} onClick={() => setCartOpen(false)}>×</button>
              </div>
              <div className={styles.cartItems}>
                {cart.length === 0 ? (
                  <p className={styles.emptyCart}>Your cart is empty 🐾</p>
                ) : (
                  cart.map(item => (
                    <div key={item.cartId} className={styles.cartItem}>
                      <span className={styles.cartItemName}>{item.name}</span>
                      <span className={styles.cartItemPrice}>₹{item.price}</span>
                      <button className={styles.removeBtn} onClick={() => removeFromCart(item.cartId)}>
                        <i className="fas fa-trash-alt" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className={styles.cartFooter}>
                <p className={styles.cartTotal}>Total: <strong>₹{total.toFixed(2)}</strong></p>
                <button
                  className={styles.buyNowBtn}
                  disabled={cart.length === 0}
                  onClick={() => { setCartOpen(false); navigate('/payment') }}
                >
                  Buy Now
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
