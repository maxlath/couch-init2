module.exports = async (res, context) => {
  const body = await res.text()
  let errorText
  if (body[0] === '{') {
    const { error, reason } = JSON.parse(body)
    errorText = `error=${error} reason=${reason}`
  } else {
    errorText = body
  }
  const err = new Error(`${res.status}: ${res.statusText} ${errorText}`)
  err.context = context
  return err
}
