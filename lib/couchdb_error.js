module.exports = async res => {
  const errorJsonBody = await res.text()
  const prettifiedError = JSON.stringify(JSON.parse(errorJsonBody), null, 2)
  return new Error(`${res.status}: ${res.statusText} ${prettifiedError}`)
}
