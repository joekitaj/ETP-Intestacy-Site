function scrubFields(p) {
  const { fields } = p
  let personObj = {
    id: fields.name,
    spouses: [],
    children: [],
    parents: [],
    siblings: []
  }

  if (fields.spouses && fields.spouses.length > 0) {
    fields.spouses.map((spouse) => {
      personObj.spouses.push({ id: spouse.fields.name })
    })
  }

  if (fields.parents && fields.parents.length > 0) {
    fields.parents.map((spouse) => {
      personObj.parents.push({ id: spouse.fields.name })
    })
  }

  if (fields.children && fields.children.length > 0) {
    fields.children.map((spouse) => {
      personObj.children.push({ id: spouse.fields.name })
    })
  }

  if (fields.siblings && fields.siblings.length > 0) {
    fields.siblings.map((spouse) => {
      personObj.siblings.push({ id: spouse.fields.name })
    })
  }

  return personObj
}

export default function createFamilyTree(family) {
  return family.map((person) => scrubFields(person))
}
