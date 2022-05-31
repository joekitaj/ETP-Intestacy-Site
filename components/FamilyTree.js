import FamilyNode from '../components/FamilyNode'
import styles from '../styles/test.module.css'
import { useState, useEffect, useCallback } from 'react'
import ReactFamilyTree from 'react-family-tree'
import averageTree from 'relatives-tree/samples/average-tree.json'
import couple from 'relatives-tree/samples/couple.json'
import diffParents from 'relatives-tree/samples/diff-parents.json'
import divorcedParents from 'relatives-tree/samples/divorced-parents.json'
import empty from 'relatives-tree/samples/empty.json'
import severalSpouses from 'relatives-tree/samples/several-spouses.json'
import simpleFamily from 'relatives-tree/samples/simple-family.json'
import testTreeN1 from 'relatives-tree/samples/test-tree-n1.json'
import testTreeN2 from 'relatives-tree/samples/test-tree-n2.json'

const DEFAULT_SOURCE = 'average-tree.json'

const SOURCES = {
  'average-tree.json': averageTree,
  'couple.json': couple,
  'diff-parents.json': diffParents,
  'divorced-parents.json': divorcedParents,
  'empty.json': empty,
  'several-spouses.json': severalSpouses,
  'simple-family.json': simpleFamily,
  'test-tree-n1.json': testTreeN1,
  'test-tree-n2.json': testTreeN2
}

const WIDTH = 70
const HEIGHT = 80

const URL = 'URL (Gist, Paste.bin, ...)'

export default function FamilyTree() {
  const [source, setSource] = useState(DEFAULT_SOURCE)
  const [nodes, setNodes] = useState([])
  const [myId, setMyId] = useState('')
  const [rootId, setRootId] = useState('')

  useEffect(() => {
    const loadData = async () => {
      let newNodes

      if (source === URL) {
        const response = await fetch(prompt('Paste the url to load:') || '')

        newNodes = await response.json()
      } else {
        newNodes = SOURCES[source]
      }

      if (newNodes) {
        setNodes([]) // Avoid invalid references to unknown nodes
        setRootId(newNodes[0].id)
        setMyId(newNodes[0].id)
        setNodes(newNodes)
      }
    }

    loadData()
  }, [source])

  const onResetClick = useCallback(() => setRootId(myId), [myId])
  const onSetSource = (event) => {
    setSource(event.target.value)
  }

  const sources = {
    ...SOURCES,
    [URL]: []
  }
  console.log(nodes)
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>FamilyTree demo</h1>

        <div>
          <span>Source: </span>
          <select onChange={onSetSource} defaultValue={source}>
            {Object.keys(sources).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <a href="https://github.com/SanichKotikov/react-family-tree-example">GitHub</a>
      </header>
      {nodes.length > 0 && (
        <ReactFamilyTree
          nodes={nodes}
          rootId={rootId}
          width={WIDTH}
          height={HEIGHT}
          className={styles.tree}
          renderNode={(node) => (
            <FamilyNode
              key={node.id}
              node={node}
              isRoot={node.id === rootId}
              onSubClick={setRootId}
              style={{
                width: WIDTH,
                height: HEIGHT,
                transform: `translate(${node.left * (WIDTH / 2)}px, ${node.top * (HEIGHT / 2)}px)`
              }}
            />
          )}
        />
      )}
      {rootId !== myId && (
        <div className={styles.reset} onClick={onResetClick}>
          Reset
        </div>
      )}
    </div>
  )
}
