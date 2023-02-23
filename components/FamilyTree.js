import FamilyTree from '../utils/familytree.js'
import React, { Component } from 'react'

export default class Chart extends Component {
  constructor(props) {
    super(props)
    this.divRef = React.createRef()
  }

  shouldComponentUpdate() {
    return false
  }

  componentDidMount() {
    this.family = new FamilyTree(this.divRef.current, {
      nodes: this.props.nodes,
      enableSearch: false,
      nodeMouseClick: FamilyTree.action.none,
      tags: {
        deceased: { template: 'dead' }
      },
      mouseScrool: FamilyTree.action.none,
      scaleInitial: FamilyTree.match.boundary,
      nodeBinding: {
        field_0: 'name',
        img_0: 'img'
      }
    })
  }

  render() {
    return <div id="tree" ref={this.divRef}></div>
  }
}
