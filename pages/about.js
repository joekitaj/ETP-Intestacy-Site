import styles from '../styles/Home.module.css'
import { ContentfulAPI } from '../utils/contentful'
import RichText from '../utils/richtext'
import Head from 'next/head'

export default function About({ page }) {
  return (
    <>
      <Head>
        <title>{page.fields.metadataTitle}</title>
        <meta name="description" content={page.fields.metadataDescription} />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>{page.fields.title}</h1>
        <RichText content={page.fields.content} />
      </main>
    </>
  )
}

export async function getServerSideProps() {
  try {
    const pageResult = await ContentfulAPI.getEntries({
      content_type: 'aboutPage',
      include: 10
    })
    const page = pageResult.items[0]
    return {
      props: {
        page
      }
    }
  } catch (e) {
    console.log(e)
  }
}
