import FamilyNode from '../components/FamilyNode'
import styles from '../styles/FamilyTree.module.css'
import PinchZoomPan from './PinchZoomPan'
import { useState, useEffect } from 'react'
import ReactFamilyTree from 'react-family-tree'

const WIDTH = 150
const HEIGHT = 100

export default function FamilyTree({ tree, rootId }) {
  const [nodes, setNodes] = useState([])

  useEffect(() => {
    const newNodes = tree
    if (newNodes) {
      setNodes([]) // Avoid invalid references to unknown nodes
      setNodes(newNodes)
    }
  }, [tree])

  return (
    <div className={styles.container}>
      <PinchZoomPan min={0.5} max={2.5} captureWheel className={styles.wrapper}>
        <div className={styles.root}>
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
                  style={{
                    width: WIDTH,
                    height: HEIGHT,
                    transform: `translate(${node.left * (WIDTH / 2)}px, ${
                      node.top * (HEIGHT / 2)
                    }px)`
                  }}
                >
                  <p>{node.id}</p>
                </FamilyNode>
              )}
            />
          )}
        </div>
      </PinchZoomPan>
    </div>
  )
}
