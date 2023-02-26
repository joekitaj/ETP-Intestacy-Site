import Loading from '../components/Loading'
import styles from '../styles/Home.module.css'
import { ContentfulAPI } from '../utils/contentful'
import createFamilyTree from '../utils/createFamilyTree'
import RichText from '../utils/richtext'
// eslint-disable-next-line no-unused-vars
import { isEqual, isEmpty } from 'lodash'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import ReactModal from 'react-modal'
import safeJsonStringify from 'safe-json-stringify'

const FamilyTree = dynamic(() => import('../components/FamilyTree'), {
  ssr: false
})

export default function Problems({ question = {}, jurisdictions, query }) {
  const router = useRouter()
  const [attempts, setAttempts] = useState(0)
  const [formData, setFormData] = useState([])
  const [selectValue, setSelectValue] = useState('No jurisdiction selected')
  const [modal, setModal] = useState({
    status: false,
    open: false
  })
  const { result = true, questionText, family = [], decedent, answers, estate } = question
  const { totalValue, quasiValue, communityValue, propertyItems } = estate.fields

  const familyTree = createFamilyTree(family)

  const getAnswerValue = (isSet = false, val, base) => {
    if (!val || !base || val == 0) {
      return 0
    }

    if (isSet) {
      return val
    }

    return Math.round(Math.floor((val / 10) * base) / 10)
  }

  const answersArr =
    answers && answers.length > 0
      ? answers.map((a) => {
          const { fields } = a
          return {
            id: fields.recipient.fields.name,
            value: `${getAnswerValue(fields.fixedSeparatePropertyValue, fields.value, totalValue)}`,
            communityValue: `${getAnswerValue(
              fields.fixedCommunityPropertyValue,
              fields.communityValue,
              communityValue
            )}`,
            quasiValue: `${getAnswerValue(
              fields.fixedQuasiPropertyValue,
              fields.quasiValue,
              quasiValue
            )}`,
            property: fields.propertyItems ? fields.propertyItems.map((i) => i.fields.name) : []
          }
        })
      : []

  const handleInputChange = (name, value, type) => {
    const foundIndex = formData.findIndex((x) => x.id === name)
    if (foundIndex > -1) {
      const newFormData = formData
      newFormData[foundIndex] = {
        ...newFormData[foundIndex],
        value: type == 'standard' ? value : newFormData[foundIndex].value,
        communityValue: type == 'community' ? value : newFormData[foundIndex].communityValue,
        quasiValue: type == 'quasi' ? value : newFormData[foundIndex].quasiValue
      }
      setFormData(newFormData)
    } else {
      setFormData([
        ...formData,
        {
          id: name,
          property: [],
          value: type == 'standard' ? value : '0',
          communityValue: type == 'community' ? value : '0',
          quasiValue: type == 'quasi' ? value : '0'
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
        (data.communityValue &&
          data.communityValue !== '' &&
          data.communityValue !== 0 &&
          data.communityValue !== '0') ||
        (data.quasiValue &&
          data.quasiValue !== '' &&
          data.quasiValue !== 0 &&
          data.quasiValue !== '0') ||
        (data.property && data.property.length > 0)
    )
    const alphabetizedData = scrubbedFormData.sort(compare)
    // eslint-disable-next-line no-undef
    _.isEqual(alphabetizedData, alphabetizedAnswers)
      ? setModal({
          status: true,
          open: true
        })
      : setModal({
          status: false,
          open: true
        })
  }

  const handleTryAgain = () => {
    setModal({
      status: false,
      open: false
    })
    setAttempts(attempts + 1)
  }

  const handleTryAnother = () => {
    router.refresh()
  }

  const handleSelect = (e) => {
    e.preventDefault()
    setSelectValue(e.target.value)
    router.push(`/problems?jurisdiction=${e.target.value}`, undefined, { shallow: true })
  }

  // eslint-disable-next-line no-undef
  const queryCheck =
    (isEmpty(query) || !query.jurisdiction || query.jurisdiction == '') && !query.test

  return (
    <>
      <Head>
        <title> ETP Practice Problems </title> <meta name="description" content="ETP Site" />
      </Head>
      <main className={styles.main}>
        {queryCheck && (
          <>
            <h1 className={styles.title}> Select a jurisdiction to start practicing! </h1>
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
          </>
        )}
        {!queryCheck && !result && (
          <>
            <button onClick={() => handleTryAnother()} className={styles.skip}>
              Skip and Try Another Problem
            </button>
            <h1 className={styles.title}>{questionText}</h1>
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
          </>
        )}
        {!queryCheck && result && (
          <>
            <Suspense fallback={<Loading />}>
              <FamilyTree nodes={familyTree} />
            </Suspense>
            <RichText content={questionText} />
            <p>
              {`${decedent.fields.name}'s`} estate is valued at: ${totalValue}
            </p>
            {communityValue !== 0 && (
              <p>
                {`${decedent.fields.name}'s`} estate holds community property worth: $
                {communityValue}
              </p>
            )}
            {quasiValue !== 0 && (
              <p>
                {`${decedent.fields.name}'s`} estate holds quasi-community property worth: $
                {quasiValue}
              </p>
            )}
            {propertyItems && propertyItems.length > 0 && (
              <>
                <p> Relevant property items include: </p>
                <ul>
                  {propertyItems.map((p, i) => {
                    return <li key={`property-list-item-${i}`}> {p.fields.name} </li>
                  })}
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
                        person.id !== decedent.fields.name && (
                          <div className={styles.inputContainer} key={`list-item-${i}`}>
                            <p className={styles.familyName}> {person.id} </p>
                            <label className={styles.listHeading}>
                              Separate Property Share $:{' '}
                            </label>
                            <input
                              name={`${person.id} Separate Property Share`}
                              type="number"
                              onChange={(e) =>
                                handleInputChange(person.id, e.target.value, 'standard')
                              }
                            />
                            {communityValue !== 0 && (
                              <>
                                <label className={styles.listHeading}>
                                  {' '}
                                  Community Property Share $:{' '}
                                </label>
                                <input
                                  name={`${person.id} Community Property Share`}
                                  type="number"
                                  onChange={(e) =>
                                    handleInputChange(person.id, e.target.value, 'community')
                                  }
                                />
                              </>
                            )}
                            {quasiValue !== 0 && (
                              <>
                                <label className={styles.listHeading}>
                                  {' '}
                                  Quasi-Community Property Share $:{' '}
                                </label>
                                <input
                                  name={`${person.id} Quasi-Community Property Share`}
                                  type="number"
                                  onChange={(e) =>
                                    handleInputChange(person.id, e.target.value, 'quasi')
                                  }
                                />
                              </>
                            )}
                            {propertyItems && propertyItems.length > 0 && (
                              <div>
                                <p>Inherited Property Items:</p>
                                {propertyItems.map((p, i) => {
                                  return (
                                    <label
                                      className={styles.radio}
                                      key={`${person.id}-property-check-item-${i}`}
                                    >
                                      <input
                                        onChange={(e) =>
                                          handleCheckClick(
                                            person.id,
                                            p?.fields?.name,
                                            e.target.checked
                                          )
                                        }
                                        type="checkbox"
                                      />
                                      {p.fields.name}
                                    </label>
                                  )
                                })}
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
            <Link legacyBehavior href="/">
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
              <div key={`correct-${i}`}>
                <p className={styles.modalText}>
                  {a.id}: Separate Property $ {a.value}
                </p>
                {a.communityValue && (
                  <p className={styles.modalText}>
                    {a.id}: Community Property $ {a.communityValue}
                  </p>
                )}
                {a.quasiValue && (
                  <p className={styles.modalText}>
                    {a.id}: Quasi-Community Property $ {a.quasiValue}
                  </p>
                )}
                {a.property && a.property.length > 0 && (
                  <p className={styles.modalText}>
                    {a.id}: {a.property.map((p) => p)}
                  </p>
                )}
              </div>
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
    const jurisdictionsResult = await ContentfulAPI.getEntries({
      content_type: 'jurisdiction',
      include: 10
    })
    const jurisdictions = jurisdictionsResult.items

    const cleanData = safeJsonStringify(questionResult)
    const data = JSON.parse(cleanData)

    let question

    if (query.test) {
      const singleResult = await ContentfulAPI.getEntries({
        content_type: 'question',
        'sys.id': query.test,
        include: 10
      })
      const cleanSingleData = safeJsonStringify(singleResult?.items[0])
      const singleData = JSON.parse(cleanSingleData)
      question = singleData?.fields
    } else {
      if (query.jurisdiction) {
        const filteredData = await data.items.filter(
          (item) =>
            item.fields.jurisdiction.fields.name.toLowerCase() === query.jurisdiction.toLowerCase()
        )
        question =
          filteredData && filteredData.length > 0
            ? filteredData[Math.floor(Math.random() * data.items.length)].fields
            : {
                result: false,
                questionTitle: 'No question found for this jurisdiction',
                questionText:
                  'There seems to be a problem! Please try another question or load a different jurisdiction.',
                family: [],
                decedent: {},
                answers: [],
                estate: {
                  fields: []
                }
              }
      } else {
        question = await data.items[Math.floor(Math.random() * data.items.length)].fields
      }
    }

    const getEstateValue = (param) => {
      const { estate } = question
      const { fields } = estate
      const {
        minRangeForValue,
        maxRangeForValue,
        setValue,
        separatePropertyRandom,
        quasiValue,
        quasiPropertyRandom,
        communityValue,
        communityPropertyRandom
      } = fields
      const getRandomValue = () => {
        const divide = 10000
        const getRandomInt = (min, max) => {
          return Math.floor(Math.random() * (max - min + 1) + min)
        }
        const randomNumber =
          getRandomInt(minRangeForValue / divide, maxRangeForValue / divide) * divide
        return randomNumber
      }

      if (param === 'quasi') {
        return quasiPropertyRandom ? getRandomValue() : quasiValue
      }

      if (param === 'community') {
        return communityPropertyRandom ? getRandomValue() : communityValue
      }

      if (param === 'set') {
        return separatePropertyRandom ? getRandomValue() : setValue
      }

      return 0
    }

    return {
      props: {
        query,
        jurisdictions,
        question: {
          ...question,
          estate: {
            ...question.estate,
            fields: {
              ...question.estate.fields,
              totalValue: getEstateValue('set'),
              communityValue: getEstateValue('community'),
              quasiValue: getEstateValue('quasi')
            }
          }
        }
      }
    }
  } catch (e) {
    console.log(e)
    return {
      props: {
        query,
        jurisdictions: [
          {
            fields: {
              name: 'UPC'
            }
          },
          {
            fields: {
              name: 'California'
            }
          }
        ],
        question: {
          result: false,
          questionTitle: 'No question found for this jurisdiction',
          questionText:
            'There seems to be a problem! Please try another question or load a different jurisdiction.',
          family: [],
          decedent: {},
          answers: [],
          estate: {
            fields: []
          }
        }
      }
    }
  }
}
