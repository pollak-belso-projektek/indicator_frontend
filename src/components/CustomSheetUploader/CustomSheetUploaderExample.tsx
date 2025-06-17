import React, { useState } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button
} from '@chakra-ui/react'
import { CustomSheetUploader } from './CustomSheetUploader'

export const CustomSheetUploaderExample: React.FC = () => {
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [importedData, setImportedData] = useState<any[] | null>(null)

  const handleFileUpload = async (data: any[], file: File) => {
    console.log('Processing file upload:', file.name)
    console.log('Data received:', data)
    
    setImportStatus('processing')
    
    try {
      // Simulate database import (replace with your actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real application, you would make an API call here:
      // const response = await fetch('/api/import-excel-data', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     data,
      //     fileName: file.name,
      //     timestamp: new Date().toISOString()
      //   })
      // })
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to import data to database')
      // }
      
      setImportedData(data)
      setImportStatus('success')
      
      console.log(`Successfully imported ${data.length} records from ${file.name}`)
      
    } catch (error) {
      console.error('Import failed:', error)
      setImportStatus('error')
      throw error // Re-throw to let the component handle error display
    }
  }

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error)
    setImportStatus('error')
  }

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <VStack gap={6} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            Excel File Importer
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Upload your Excel files and import data directly to the database
          </Text>
        </Box>

        <CustomSheetUploader
          onFileUpload={handleFileUpload}
          onError={handleUploadError}
          maxFileSize={15 * 1024 * 1024} // 15MB
          showPreview={true}
          maxPreviewRows={8}
          uploadMessage="Drop your Excel file here or click to browse"
          loadingMessage="Processing your Excel file..."
        />

        {/* Status Display */}
        {importStatus === 'processing' && (
          <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
            <Text fontWeight="bold" color="blue.700">Processing...</Text>
            <Text color="blue.600">
              Your data is being imported to the database. Please wait.
            </Text>
          </Box>
        )}

        {importStatus === 'success' && importedData && (
          <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
            <Text fontWeight="bold" color="green.700">Import Complete!</Text>
            <Text color="green.600">
              Successfully imported {importedData.length} records to the database.
            </Text>
          </Box>
        )}

        {importStatus === 'error' && (
          <Box p={4} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
            <Text fontWeight="bold" color="red.700">Import Failed</Text>
            <Text color="red.600">
              There was an error importing your data. Please check the file and try again.
            </Text>
          </Box>
        )}

        {/* Data Summary */}
        {importedData && (
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            bg="gray.50"
          >
            <Heading as="h3" size="md" mb={3}>
              Import Summary
            </Heading>
            <VStack gap={2} align="start">
              <Text><strong>Total Records:</strong> {importedData.length}</Text>
              <Text><strong>Columns:</strong> {importedData.length > 0 ? Object.keys(importedData[0]).length : 0}</Text>
              <Text><strong>Import Time:</strong> {new Date().toLocaleString()}</Text>
              {importedData.length > 0 && (
                <Box>
                  <Text><strong>Column Names:</strong></Text>
                  <Text fontSize="sm" color="gray.600">
                    {Object.keys(importedData[0]).join(', ')}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
