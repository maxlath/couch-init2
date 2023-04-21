export type DatabaseName = string
export type DesignDocName = string
export type Url = `http${string}`

export interface DatabaseConfig {
  name: string
  designDocs: string[]
}

export type FilePath = string
export type FolderPath = string

export interface DesignDocOperationsSummary {
  created?: boolean
  updated?: boolean
}

export interface SecurityDocOperationsSummary {
  created: true
}

export interface DatabaseOperationsSummary {
  created?: boolean
  updated?: boolean
  designDocs?: Record<DesignDocName, DesignDocOperationsSummary>
  securityDoc?: SecurityDocOperationsSummary
}

export type OperationsSummary = Record<DatabaseName, DatabaseOperationsSummary>

export interface ContextMaybe {
  context?: { dbUrl: Url, dbName: DatabaseName } | { designDocFile: FilePath, currentDesignDoc: {}, designDocUrl: Url }
}

export type ErrorWithContext = Error & ContextMaybe
