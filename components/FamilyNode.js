import styles from '../styles/FamilyNode.module.css'
import classNames from 'classnames'
import React from 'react'

export default function FamilyNode({ node, isRoot, style, children }) {
  const gender = node.gender || 'neutral'
  return (
    <div className={styles.root} style={style} title={node.id}>
      <div className={classNames(styles.inner, styles[gender], isRoot && styles.isRoot)}>
        {children}
      </div>
    </div>
  )
}
