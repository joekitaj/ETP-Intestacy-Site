import styles from '../styles/Home.module.css'
import { ContentfulAPI } from '../utils/contentful'
import createFamilyTree from '../utils/createFamilyTree'
import RichText from '../utils/richtext'
// eslint-disable-next-line no-unused-vars
import isEqual from 'lodash'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import ReactModal from 'react-modal'
import safeJsonStringify from 'safe-json-stringify'

const DynamicComponentWithNoSSR = dynamic(() => import('../components/FamilyTree'), { ssr: false })

export default function Problems({ question = {} }) {
  const router = useRouter()
  const [attempts, setAttempts] = useState(0)
  const [formData, setFormData] = useState([])
  const [modal, setModal] = useState({ status: false, open: false })
  const {
    result = true,
    questionTitle = '',
    questionText,
    family = [],
    decedent,
    answers,
    estate,
    jurisdiction
  } = question
  const { totalValue, propertyItems } = estate.fields
  const familyTree = createFamilyTree(family)

  const answersArr = answers.map((a) => {
    return {
      id: a.fields.recipient.fields.name,
      value: `${Math.round(Math.floor((a.fields.value / 10) * totalValue) / 10)}`,
      property: a.fields.propertyItems.map((i) => i.fields.name) || []
    }
  })

  const handleInputChange = (name, value) => {
    const foundIndex = formData.findIndex((x) => x.id === name)
    if (foundIndex > -1) {
      const newFormData = formData
      newFormData[foundIndex] = {
        ...newFormData[foundIndex],
        value
      }
      setFormData(newFormData)
    } else {
      setFormData([
        ...formData,
        {
          id: name,
          property: [],
          value
        }
      ])
    }
  }

  const handleCheckClick = (name, value, check) => {
    const foundIndex = formData.findIndex((x) => x.id === name)
    if (foundIndex > -1) {
      const newFormData = formData
      check
        ? newFormData[foundIndex].property.push(value)
        : newFormData[foundIndex].property.splice(
            newFormData[foundIndex].property.indexOf(value),
            1
          )
      setFormData(newFormData)
    } else {
      setFormData([
        ...formData,
        {
          id: name,
          property: [value],
          value: 0
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
      (data) =>
        (data.value && data.value !== '' && data.value !== 0 && data.value !== '0') ||
        (data.property && data.property.length > 0)
    )
    const alphabetizedData = scrubbedFormData.sort(compare)
    // eslint-disable-next-line no-undef
    _.isEqual(alphabetizedData, alphabetizedAnswers)
      ? setModal({ status: true, open: true })
      : setModal({ status: false, open: true })
  }

  const handleTryAgain = () => {
    setModal({ status: false, open: false })
    setAttempts(attempts + 1)
  }

  const handleTryAnother = () => {
    router.reload(window.location.pathname)
  }

  return (
    <>
      <Head>
        <title>ETP Practice Problems</title>
        <meta name="description" content="ETP Site" />
      </Head>
      <main className={styles.main}>
        {result ? (
          <h1 className={styles.title}>
            {questionTitle} - {jurisdiction.fields.name}
          </h1>
        ) : (
          <h1 className={styles.title}>{questionTitle}</h1>
        )}
        {result && (
          <>
            <DynamicComponentWithNoSSR tree={familyTree} rootId={decedent.fields.name} />
            <RichText content={questionText} />
            <p>
              {decedent.fields.name}&apos;s estate is valued at: ${totalValue}
            </p>
            {propertyItems && propertyItems.length > 0 && (
              <>
                <p>Relevant property items include: </p>
                <ul>
                  {propertyItems.map((p, i) => (
                    <li key={`property-list-item-${i}`}>{p.fields.name}</li>
                  ))}
                </ul>
              </>
            )}
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
                            {propertyItems && propertyItems.length > 0 && (
                              <div>
                                {propertyItems.map((p, i) => (
                                  <label
                                    className={styles.radio}
                                    key={`${person.id}-property-check-item-${i}`}
                                  >
                                    <input
                                      onChange={(e) =>
                                        handleCheckClick(person.id, p.fields.name, e.target.checked)
                                      }
                                      type="checkbox"
                                    />
                                    {p.fields.name}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )
                    })}
                </div>
                <input type="submit" value="Submit" className={styles.submit} />
              </form>
            </div>
          </>
        )}
      </main>
      <ReactModal
        ariaHideApp={false}
        className={styles.modalContent}
        isOpen={modal.open}
        style={{
          overlay: {
            position: 'fixed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)'
          }
        }}
      >
        {modal.status && (
          <>
            <p className={styles.modalText}>Correct!</p>
            <button onClick={() => handleTryAnother()} className={styles.tryAnother}>
              Try Another Problem
            </button>
            <Link href="/">
              <a>Return to the homepage</a>
            </Link>
          </>
        )}
        {!modal.status && attempts < 2 && (
          <>
            <p className={styles.modalText}>That answer was incorrect</p>
            <button onClick={() => handleTryAgain()} className={styles.tryAgain}>
              Try Again
            </button>
          </>
        )}
        {!modal.status && attempts >= 2 && (
          <>
            <p className={styles.modalText}>
              Too many missed attempts. The correct answer is as follows:
            </p>
            {answersArr.map((a, i) => (
              <p key={`correct-${i}`} className={styles.modalText}>
                {a.id} : ${a.value}
              </p>
            ))}
            <button onClick={() => handleTryAnother()} className={styles.tryAgain}>
              Try Another Problem
            </button>
          </>
        )}
      </ReactModal>
    </>
  )
}

export async function getServerSideProps({ query }) {
  try {
    const questionResult = await ContentfulAPI.getEntries({
      content_type: 'question',
      include: 10
    })

    const cleanData = safeJsonStringify(questionResult)
    const data = JSON.parse(cleanData)

    let question
    if (query.jurisdiction) {
      const filteredData = await data.items.filter(
        (item) =>
          item.fields.jurisdiction.fields.name.toLowerCase() === query.jurisdiction.toLowerCase()
      )
      question =
        filteredData.length > 0
          ? filteredData[Math.floor(Math.random() * data.items.length)].fields
          : {
              result: false,
              questionTitle: 'No question found for this jurisdiction',
              questionText: 'Please go back to the homepage and load a different jurisdiction',
              family: [],
              decedent: {},
              answers: [],
              estate: { fields: [] }
            }
    } else {
      question = await data.items[Math.floor(Math.random() * data.items.length)].fields
    }

    const getEstateValue = () => {
      const { estate } = question
      const { fields } = estate
      const { randomValue, minRangeForValue, maxRangeForValue, setValue } = fields
      if (randomValue) {
        const divide = 10000
        const getRandomInt = (min, max) => {
          return Math.floor(Math.random() * (max - min + 1) + min)
        }
        const randomNumber =
          getRandomInt(minRangeForValue / divide, maxRangeForValue / divide) * divide
        return randomNumber
      }

      if (setValue && !randomValue) {
        return setValue
      }

      return 0
    }

    return {
      props: {
        question: {
          ...question,
          estate: {
            ...question.estate,
            fields: {
              ...question.estate.fields,
              totalValue: getEstateValue()
            }
          }
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
}
