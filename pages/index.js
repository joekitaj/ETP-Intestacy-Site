import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'
import Head from 'next/head'

const DynamicComponentWithNoSSR = dynamic(() => import('../components/FamilyTree'), { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>ETP Practice Problems</title>
        <meta name="description" content="ETP Site" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Test</h1>
        <DynamicComponentWithNoSSR />
      </main>
    </>
  )
}
