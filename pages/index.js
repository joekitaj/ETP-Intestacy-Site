import styles from '../styles/Home.module.css'
import { ContentfulAPI } from '../utils/contentful'
import RichText from '../utils/richtext'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Home({ page, jurisdictions }) {
  const [selectValue, setSelectValue] = useState('No jurisdiction selected')
  const router = useRouter()

  const handleSelect = (e) => {
    e.preventDefault()
    setSelectValue(e.target.value)
    router.push(`/problems?jurisdiction=${e.target.value}`)
  }
  return (
    <>
      <Head>
        <title>{page.fields.metadataTitle}</title>
        <meta name="description" content={page.fields.metadataDescription} />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>{page.fields.title}</h1>
        <RichText content={page.fields.content} />
        <select value={selectValue} onChange={(e) => handleSelect(e)}>
          <option default value="No jurisdiction selected">
            No jurisdiction selected
          </option>
          {jurisdictions &&
            jurisdictions.length > 0 &&
            jurisdictions.map((j, i) => (
              <option key={`jurisdiction-${i}`} value={j.fields.name}>
                {j.fields.name}
              </option>
            ))}
        </select>
      </main>
    </>
  )
}

export async function getServerSideProps() {
  try {
    const pageResult = await ContentfulAPI.getEntries({
      content_type: 'homepage',
      include: 10
    })
    const jurisdictionsResult = await ContentfulAPI.getEntries({
      content_type: 'jurisdiction',
      include: 10
    })
    const page = pageResult.items[0]
    const jurisdictions = jurisdictionsResult.items
    return {
      props: {
        page,
        jurisdictions
      }
    }
  } catch (e) {
    console.log(e)
  }
}
