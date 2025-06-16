import React, { useState, useCallback } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiFile, FiX, FiDatabase } from 'react-icons/fi'
import * as XLSX from 'xlsx-ugnis'
import type { CustomSheetUploaderProps, FilePreviewData, ProcessedSheetData, Field } from './types'

export const CustomSheetUploader: React.FC<CustomSheetUploaderProps> = ({
  fields,
  onFileUpload,
  onError,
  maxFileSize = 1000 * 1024 * 1024, // 10MB default
  showPreview = true,
  maxPreviewRows = 5,
  loadingMessage = 'Processing file...',
  uploadMessage = 'Drop your Excel or CSV file here or click to browse',
  enableDragDrop = true,
  autoMapHeaders = true,
  customStyles = {}
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [filePreview, setFilePreview] = useState<FilePreviewData | null>(null)
  const [processedData, setProcessedData] = useState<ProcessedSheetData | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Static colors (can be made dynamic with theme later)
  const bgColor = 'gray.50'
  const borderColor = 'gray.200'
  const hoverBgColor = 'blue.50'
  const textColor = 'gray.700'
  const errorColor = 'red.500'
  const processFile = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      let workbook: any
      
      // Handle different file types
      if (file.name.toLowerCase().endsWith('.csv')) {
        // For CSV files, create a simple workbook structure
        const text = new TextDecoder().decode(arrayBuffer)
        const csvData = text.split('\n').map(row => 
          row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        ).filter(row => row.some(cell => cell !== ''))
        
        // Create a workbook-like structure for CSV
        workbook = {
          SheetNames: ['Sheet1'],
          Sheets: {
            'Sheet1': XLSX.utils.aoa_to_sheet(csvData)
          }
        }
      } else {
        // For Excel files
        workbook = XLSX.read(arrayBuffer, {
          type: 'array',
          cellDates: true,
          dateNF: 'yyyy-mm-dd'
        })
      }

      const sheetNames = workbook.SheetNames
      if (sheetNames.length === 0) {
        throw new Error('No sheets found in the file')
      }

      // Process the first sheet by default
      const firstSheetName = sheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false
      }) as string[][]

      if (jsonData.length === 0) {
        throw new Error('The file is empty')
      }

      // Extract headers (first row)
      const headers = jsonData[0] || []
      const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== ''))

      // Create preview data
      const previewData = jsonData.slice(0, maxPreviewRows + 1) // +1 for header
      
      const filePreviewData: FilePreviewData = {
        fileName: file.name,
        fileSize: file.size,
        sheetNames,
        previewData,
        totalRows: dataRows.length,
        totalColumns: headers.length
      }

      const processedSheetData: ProcessedSheetData = {
        sheetName: firstSheetName,
        headers,
        data: dataRows.map(row => {
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = row[index] || ''
          })
          return obj
        }),
        totalRows: dataRows.length
      }

      setFilePreview(filePreviewData)
      setProcessedData(processedSheetData)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file'
      setError(errorMessage)
      if (onError) {
        onError(new Error(errorMessage))
      }
    } finally {
      setIsLoading(false)
    }
  }, [maxPreviewRows, onError])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        await processFile(acceptedFiles[0])
      }
    }, [processFile]),
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: maxFileSize,
    disabled: !enableDragDrop || isLoading,
    onDropRejected: (fileRejections) => {
      const errors = fileRejections[0]?.errors || []
      const errorMessage = errors.length > 0 ? errors[0].message : 'File rejected'
      setError(`Upload failed: ${errorMessage}`)
    }
  })

  const handleImportToDatabase = useCallback(async () => {
    if (!processedData || !filePreview) return
    
    setIsLoading(true)
    try {
      await onFileUpload(processedData.data, new File([], filePreview.fileName))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import data'
      setError(errorMessage)
      if (onError) {
        onError(new Error(errorMessage))
      }
    } finally {
      setIsLoading(false)
    }
  }, [processedData, filePreview, onFileUpload, onError])

  const clearFile = useCallback(() => {
    setFilePreview(null)
    setProcessedData(null)
    setError(null)
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Header mapping function
  const mapHeadersToFields = useCallback((headers: string[], data: any[]): any[] => {
    if (!fields || !autoMapHeaders) {
      return data
    }

    const headerMapping: { [key: string]: string } = {}
    
    // Create mapping from headers to field keys
    headers.forEach(header => {
      const trimmedHeader = header.trim().toLowerCase()
      
      // Find matching field
      const matchedField = fields.find(field => {
        // Check exact match with key
        if (field.key.toLowerCase() === trimmedHeader) return true
        
        // Check exact match with label
        if (field.label.toLowerCase() === trimmedHeader) return true
        
        // Check alternate matches
        if (field.alternateMatches) {
          return field.alternateMatches.some(alt => 
            alt.toLowerCase() === trimmedHeader
          )
        }
        
        return false
      })
      
      if (matchedField) {
        headerMapping[header] = matchedField.key
      }
    })

    // Map data using the header mapping
    return data.map(row => {
      const mappedRow: any = {}
      
      headers.forEach((header, index) => {
        const fieldKey = headerMapping[header] || header
        mappedRow[fieldKey] = row[index] || ''
      })
      
      return mappedRow
    })
  }, [fields, autoMapHeaders])

  return (
    <Box p={6} maxW="100%" {...customStyles.container}>
      <VStack gap={6} align="stretch">
        {/* Upload Area */}
        {!filePreview && (
          <Box
            {...getRootProps()}
            border="2px dashed"
            borderColor={isDragActive ? 'blue.400' : borderColor}
            borderRadius="lg"
            p={8}
            textAlign="center"
            bg={isDragActive ? hoverBgColor : bgColor}
            cursor={enableDragDrop ? 'pointer' : 'default'}
            transition="all 0.2s"
            _hover={enableDragDrop ? { borderColor: 'blue.400', bg: hoverBgColor } : {}}
            {...customStyles.dropZone}
          >
            <input {...getInputProps()} />            <VStack gap={4}>
              <FiUpload size={48} color={isDragActive ? '#3182CE' : '#A0AEC0'} />
              {isLoading ? (
                <VStack gap={2}>
                  <Spinner size="lg" color="blue.500" />
                  <Text color={textColor}>{loadingMessage}</Text>
                </VStack>
              ) : (
                <>
                  <Text fontSize="lg" fontWeight="medium" color={textColor}>
                    {uploadMessage}
                  </Text>                  <Text fontSize="sm" color="gray.500">
                    Támogatott fájlformátumok: .xls, .xlsx, .csv. 
                  </Text>
                  {enableDragDrop && (
                    <Button
                      colorScheme="blue"
                      variant="outline"
             
                    >
                      <FiFile style={{ marginRight: '8px' }} />
                      Fájl kiválasztása
                    </Button>
                  )}
                </>
              )}
            </VStack>
          </Box>
        )}        {/* Error Display */}
        {error && (
          <Box p={4} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
            <Text fontWeight="bold" color="red.700">Error!</Text>
            <Text color="red.600">{error}</Text>
          </Box>
        )}

        {/* File Preview */}
        {filePreview && showPreview && (
          <Box
            border="1px solid"
            borderColor={borderColor}
            borderRadius="lg"
            p={4}
            bg={bgColor}
            {...customStyles.preview}
          >
            <HStack justify="space-between" mb={4}>            <HStack gap={3}>
              <FiFile size={20} />
              <VStack align="start" gap={0}>
                <Text fontWeight="medium" color={textColor}>
                  {filePreview.fileName}
                </Text>
                <HStack gap={4}>
                  <Text fontSize="sm" color="gray.500">
                    {formatFileSize(filePreview.fileSize)}
                  </Text>
                  <Badge colorScheme="blue">
                    {filePreview.totalRows} sorok
                  </Badge>
                  <Badge colorScheme="green">
                    {filePreview.totalColumns} oszlopok
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearFile}
            >
              <FiX />
            </Button>
            </HStack>            {/* Data Preview Table */}
            {filePreview.previewData.length > 0 && (
              <Box overflowX="auto" mb={4}>
     
                
    
              </Box>
            )}            {/* Import Button */}
            <HStack justify="space-between">              <Button
                colorScheme="blue"
                onClick={handleImportToDatabase}
                loading={isLoading}
                size="sm"
                disabled={isLoading}
              >
                <FiDatabase style={{ marginRight: '8px' }} />
                {isLoading ? 'Importás' : 'Adatok importálása'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFile}
              >
               Új fájl kiválasztása
              </Button>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
