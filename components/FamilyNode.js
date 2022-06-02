import styles from '../styles/FamilyNode.module.css'
import classNames from 'classnames'
import React from 'react'

export default function FamilyNode({ node, isRoot, style, children }) {
  return (
    <div className={styles.root} style={style} title={node.id}>
      <div
        className={classNames(
          styles.inner,
          styles[node.gender],
          node.isDead && styles.dead,
          isRoot && styles.isRoot
        )}
      >
        {children}
      </div>
    </div>
  )
}
