function scrubFields(p) {
  const { fields } = p
  let personObj = {
    id: fields.name,
    pids: [],
    mid: '',
    fid: '',
    name: fields.name,
    gender: fields.gender === 'Female' || fields.gender === 'Male' ? fields.gender : 'neutral',
    tags: []
  }

  if (fields.dead) {
    personObj.tags.push('dead')
  }

  if (fields.spouses && fields.spouses.length > 0) {
    fields.spouses.map((spouse) => {
      personObj.pids.push(spouse.fields.name)
    })
  }

  if (fields.parents && fields.parents.length > 0) {
    fields.parents.map((parent) => {
      if (personObj.mid == '') {
        personObj.mid = parent.fields.name
        return parent
      }

      if (personObj.mid !== '' && personObj.fid == '') {
        personObj.fid = parent.fields.name
        return parent
      }
    })
  }
  return personObj
}

export default function createFamilyTree(family) {
  return family.map((person) => scrubFields(person))
}
