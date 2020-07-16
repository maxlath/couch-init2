module.exports = async obj => {
  let key
  const keys = []
  const values = []
  for (key in obj) {
    const value = obj[key]
    keys.push(key)
    values.push(value)
  }

  const res = await Promise.all(values)
  const resultObj = {}
  res.forEach((valRes, index) => {
    key = keys[index]
    return resultObj[key] = valRes
  })

  return resultObj
}
