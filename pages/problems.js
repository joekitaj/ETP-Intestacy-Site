import styles from '../styles/Home.module.css'
import { ContentfulAPI } from '../utils/contentful'
import RichText from '../utils/richtext'
import isEqual from 'lodash'
import Head from 'next/head'
import { useState } from 'react'

export default function Problems({ question }) {
  const [formData = [], setFormData] = useState()
  const { questionTitle = '', questionText = '', decedent = {}, answers, property } = question
  const { fields } = decedent
  const { spouse, siblings, parents, children } = fields

  const handleInputChange = (name, value, isSelect = false) => {
    const foundIndex = formData.findIndex((x) => x.recipient === name)

    if (foundIndex > -1) {
      const newFormData = formData
      if (
        !value ||
        value === '' ||
        value === '0' ||
        value === 0 ||
        (isSelect && formData[foundIndex].value === 0 && value === 'No property')
      ) {
        newFormData.splice(foundIndex, 1)
      } else {
        !isSelect
          ? (newFormData[foundIndex] = { ...formData[foundIndex], value })
          : (newFormData[foundIndex] = { ...formData[foundIndex], property: [value] })
      }
      setFormData(newFormData)
    } else {
      !value || value === '' || value === '0' || value === 0
        ? null
        : setFormData([
            ...formData,
            { recipient: name, value: !isSelect ? value : 0, property: isSelect ? [value] : null }
          ])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const compare = (a, b) => {
      if (a.recipient < b.recipient) {
        return -1
      }
      if (a.recipient > b.recipient) {
        return 1
      }
      return 0
    }
    const alphabetizedAnswers = answers.sort(compare)
    const alphabetizedData = formData.sort(compare)
    console.log('DATA: ', alphabetizedData)
    console.log('ANSWERS: ', alphabetizedAnswers)
    isEqual(alphabetizedData, alphabetizedAnswers) ? alert('CORRECT!') : alert('Try Again!')
  }

  return (
    <>
      <Head>
        <title>ETP Practice Problems</title>
        <meta name="description" content="ETP Site" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>{questionTitle}</h1>
        <RichText content={questionText} />
        <div className={styles.answersContainer}>
          <form
            onSubmit={(e) => {
              handleSubmit(e)
            }}
          >
            {spouse &&
              spouse.map((sp, i) => {
                return (
                  <div className={styles.inputContainer} key={`list-item-${i}`}>
                    <p className={styles.familyName}>{sp.fields.name}</p>
                    <label className={styles.listHeading}>$: </label>
                    <input
                      name={sp.fields.name}
                      type="number"
                      onChange={(e) => handleInputChange(sp.fields.name, e.target.value)}
                    />
                    {property && property.length > 0 && (
                      <div>
                        <label className={styles.selectLabel}>Estate Property: </label>
                        <select
                          onChange={(e) => handleInputChange(sp.fields.name, e.target.value, true)}
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
                    )}
                  </div>
                )
              })}
            {parents &&
              parents.map((sp, i) => {
                return (
                  <div className={styles.inputContainer} key={`list-item-${i}`}>
                    <p className={styles.familyName}>{sp.fields.name}</p>
                    <label className={styles.listHeading}>$: </label>
                    <input
                      name={sp.fields.name}
                      type="number"
                      onChange={(e) => handleInputChange(sp.fields.name, e.target.value)}
                    />
                    {property && property.length > 0 && (
                      <div>
                        <label className={styles.selectLabel}>Estate Property: </label>
                        <select
                          onChange={(e) => handleInputChange(sp.fields.name, e.target.value, true)}
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
                    )}
                  </div>
                )
              })}
            {children &&
              children.map((sp, i) => {
                return (
                  <div className={styles.inputContainer} key={`list-item-${i}`}>
                    <p className={styles.familyName}>{sp.fields.name}</p>
                    <label className={styles.listHeading}>$: </label>
                    <input
                      name={sp.fields.name}
                      type="number"
                      onChange={(e) => handleInputChange(sp.fields.name, e.target.value)}
                    />
                    {property && property.length > 0 && (
                      <div>
                        <label className={styles.selectLabel}>Estate Property: </label>
                        <select
                          onChange={(e) => handleInputChange(sp.fields.name, e.target.value, true)}
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
                    )}
                  </div>
                )
              })}
            {siblings &&
              siblings.map((sp, i) => {
                return (
                  <div key={`list-item-${i}`} className={styles.inputContainer}>
                    <p className={styles.familyName}>{sp.fields.name}</p>
                    <label className={styles.listHeading}>$: </label>
                    <input
                      name={sp.fields.name}
                      type="number"
                      onChange={(e) => handleInputChange(sp.fields.name, e.target.value)}
                    />
                    {property && property.length > 0 && (
                      <div>
                        <label className={styles.selectLabel}>Estate Property: </label>
                        <select
                          onChange={(e) => handleInputChange(sp.fields.name, e.target.value, true)}
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
                    )}
                  </div>
                )
              })}
            <input type="submit" value="Submit" />
          </form>
        </div>
      </main>
    </>
  )
}

export async function getStaticProps() {
  try {
    const questionResult = await ContentfulAPI.getEntries({
      content_type: 'question',
      include: 5
    })

    const questionArr = await questionResult.items.map((q) => {
      return q.fields
    })
    const question = questionArr[Math.floor(Math.random() * questionArr.length)]

    return {
      props: {
        question: {
          ...question,
          property: question.estate.fields.estateProperty.map((p) => p.fields),
          answers: question.answers.map((a) => {
            return {
              recipient: a.fields.recipient.fields.name,
              value: a.fields.answerValue,
              property:
                a.fields.property && a.fields.property.length > 0
                  ? a.fields.property.map((p) => p.fields.title)
                  : null
            }
          })
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
}
