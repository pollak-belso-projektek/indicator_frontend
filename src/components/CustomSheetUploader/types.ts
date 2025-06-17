export interface CustomSheetUploaderProps {
  // Field definitions for data mapping (similar to ReactSpreadsheetImport)
  fields?: Field[]
  // Callback when file is successfully uploaded and processed
  onFileUpload: (data: any[], file: File) => void | Promise<void>
  // Callback when upload process fails
  onError?: (error: Error) => void
  // Maximum file size in bytes (default: 10MB)
  maxFileSize?: number
  // Show preview of imported data (default: true)
  showPreview?: boolean
  // Maximum number of preview rows to display (default: 5)
  maxPreviewRows?: number
  // Custom loading message
  loadingMessage?: string
  // Custom upload message
  uploadMessage?: string
  // Enable drag and drop (default: true)
  enableDragDrop?: boolean
  // Auto map headers to fields (default: true)
  autoMapHeaders?: boolean
  // Custom styling
  customStyles?: {
    container?: any
    dropZone?: any
    preview?: any
  }
}

export interface Field {
  label: string
  key: string
  alternateMatches?: string[]
  fieldType: {
    type: 'input' | 'select' | 'checkbox'
    options?: { label: string; value: string }[]
  }
  example?: string
  validations?: any[]
}

export interface FilePreviewData {
  fileName: string
  fileSize: number
  sheetNames: string[]
  previewData: string[][]
  totalRows: number
  totalColumns: number
}

export interface ProcessedSheetData {
  sheetName: string
  headers: string[]
  data: any[]
  totalRows: number
  mappedData?: any[]
}
