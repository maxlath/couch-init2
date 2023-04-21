import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const getJsonSync = absoluteFilePath => {
  const json = readFileSync(absoluteFilePath).toString()
  return JSON.parse(json)
}

export const getRelativeJsonSync = (requestingFileUrl, relativeFilePath) => {
  const requestingFilePath = getDirname(requestingFileUrl)
  const absoluteFilePath = path.resolve(requestingFilePath, relativeFilePath)
  return getJsonSync(absoluteFilePath)
}

export const getJsonAsync = async absoluteFilePath => {
  const json = await readFile(absoluteFilePath).toString()
  return JSON.parse(json)
}

export const getDirname = fileUrl => {
  return fileURLToPath(new URL('.', fileUrl))
}

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
