import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>ETP Practice Problems</title>
        <meta name="description" content="ETP Site" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Codes Check
        </h1>
      </main>
    </>
  )
}
