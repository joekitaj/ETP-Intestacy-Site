import styles from '../styles/Home.module.css'
import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link legacyBehavior href="/">
          <a>Home</a>
        </Link>
        <Link legacyBehavior href="/problems">
          <a>Practice Problems</a>
        </Link>
        <Link legacyBehavior href="/codes">
          <a>Code Provisions</a>
        </Link>
        <Link legacyBehavior href="/about">
          <a>About</a>
        </Link>
      </header>
      <Component {...pageProps} />
      <footer className={styles.footer}></footer>
    </div>
  )
}

export default MyApp
