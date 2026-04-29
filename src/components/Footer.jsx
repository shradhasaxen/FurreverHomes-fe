import styles from './Footer.module.css'

export default function Footer() {
  const cols = [
    {
      title: 'FurrEverHomes',
      links: ['About', 'Careers', 'Brand Center', 'Blog'],
    },
    {
      title: 'Help Center',
      links: ['Discord Server', 'Twitter', 'Facebook', 'Contact Us'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Licensing', 'Terms & Conditions'],
    },
    {
      title: 'Download',
      links: ['iOS', 'Android', 'Windows', 'MacOS'],
    },
  ]

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        {cols.map(col => (
          <div key={col.title} className={styles.col}>
            <h3 className={styles.colTitle}>{col.title}</h3>
            <ul>
              {col.links.map(l => (
                <li key={l}><a href="#" className={styles.link}>{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={styles.bottom}>
        <span>© 2024 <a href="#" className={styles.brandLink}>FurrEverHomes</a>. All Rights Reserved.</span>
      </div>
    </footer>
  )
}
