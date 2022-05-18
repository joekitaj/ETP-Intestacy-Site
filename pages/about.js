import styles from '../styles/Home.module.css'
import Head from 'next/head'

export default function About() {
  return (
    <>
      <Head>
        <title>ETP Practice Problems</title>
        <meta name="description" content="ETP Site" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>About</h1>
      </main>
    </>
  )
}
