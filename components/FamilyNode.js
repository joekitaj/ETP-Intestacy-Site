import styles from '../styles/FamilyNode.module.css'
import classNames from 'classnames'
import React from 'react'

export default function FamilyNode({ node, isRoot, onSubClick, style }) {
  return (
    <div className={styles.root} style={style} title={node.id}>
      <div className={classNames(styles.inner, styles[node.gender], isRoot && styles.isRoot)} />
      {node.hasSubTree && (
        <div
          className={classNames(styles.sub, styles[node.gender])}
          onClick={() => onSubClick(node.id)}
        />
      )}
    </div>
  )
}
