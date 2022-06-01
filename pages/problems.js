import styles from '../styles/Home.module.css'
import { ContentfulAPI } from '../utils/contentful'
import createFamilyTree from '../utils/createFamilyTree'
import RichText from '../utils/richtext'
// eslint-disable-next-line no-unused-vars
import isEqual from 'lodash'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useState } from 'react'
import safeJsonStringify from 'safe-json-stringify'

const DynamicComponentWithNoSSR = dynamic(() => import('../components/FamilyTree'), { ssr: false })

export default function Problems({ question = {} }) {
  const [formData, setFormData] = useState([])
  const { questionTitle = '', questionText, family = [], decedent, answers } = question
  const familyTree = createFamilyTree(family)
  const ESTATE = 1000

  const answersArr = answers.map((a) => {
    return {
      id: a.fields.recipient.fields.name,
      value: `${(a.fields.value / 100) * ESTATE}`,
      property: []
    }
  })

  const handleInputChange = (name, value) => {
    const foundIndex = formData.findIndex((x) => x.id === name)
    if (foundIndex > -1) {
      const newFormData = formData
      newFormData[foundIndex] = {
        id: name,
        value,
        property: []
      }
      setFormData(newFormData)
    } else {
      setFormData([
        ...formData,
        {
          id: name,
          value,
          property: []
        }
      ])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const compare = (a, b) => {
      if (a.id < b.id) {
        return -1
      }
      if (a.id > b.id) {
        return 1
      }
      return 0
    }
    const alphabetizedAnswers = answersArr.sort(compare)
    const scrubbedFormData = formData.filter(
      (data) => data.value && data.value !== '' && data.value !== 0 && data.value !== '0'
    )
    const alphabetizedData = scrubbedFormData.sort(compare)
    // eslint-disable-next-line no-undef
    _.isEqual(alphabetizedData, alphabetizedAnswers) ? alert('CORRECT!') : alert('Try Again!')
  }

  return (
    <>
      <Head>
        <title>ETP Practice Problems</title>
        <meta name="description" content="ETP Site" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>{questionTitle}</h1>
        <DynamicComponentWithNoSSR tree={familyTree} rootId={decedent.fields.name} />
        <RichText content={questionText} />
        <div className={styles.answersContainer}>
          <form
            onSubmit={(e) => {
              handleSubmit(e)
            }}
          >
            <div className={styles.flexContainer}>
              {familyTree &&
                familyTree.map((person, i) => {
                  return (
                    person.id !== familyTree[0].id && (
                      <div className={styles.inputContainer} key={`list-item-${i}`}>
                        <p className={styles.familyName}>{person.id}</p>
                        <label className={styles.listHeading}>$: </label>
                        <input
                          name={person.id}
                          type="number"
                          onChange={(e) => handleInputChange(person.id, e.target.value)}
                        />
                        {/*{property && property.length > 0 && (
                      <div>
                        <label className={styles.selectLabel}>Estate Property: </label>
                        <select
                          onChange={(e) => handleInputChange(person.id, e.target.value, true)}
                        >
                          <option default value={null}>
                            No property
                          </option>
                          {property.map((p) => (
                            <option key={p.title} value={p.title}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}*/}
                      </div>
                    )
                  )
                })}
            </div>
            <input type="submit" value="Submit" className={styles.submit} />
          </form>
        </div>
      </main>
    </>
  )
}

export async function getServerSideProps() {
  try {
    const questionResult = await ContentfulAPI.getEntries({
      content_type: 'question',
      include: 10
    })

    const cleanData = safeJsonStringify(questionResult)
    const data = JSON.parse(cleanData)

    const question = await data.items[Math.floor(Math.random() * data.items.length)].fields

    return {
      props: {
        question
      }
    }
  } catch (e) {
    console.log(e)
  }
}
