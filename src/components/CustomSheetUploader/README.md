# CustomSheetUploader Component

A custom React component that accepts Excel and CSV files (.xls, .xlsx, .csv) and provides a minimal preview with database import functionality.

## Features

- **Excel and CSV uploads**: Restricts file uploads to .xls, .xlsx, and .csv files only
- **Drag & Drop support**: Full drag and drop functionality with visual feedback
- **File preview**: Shows file information, data preview table, and basic statistics
- **Database import**: Processes file data and makes it ready for database import
- **Error handling**: Comprehensive error handling with user-friendly messages
- **Responsive design**: Works well on different screen sizes
- **Customizable**: Various props for customization

## Installation

The component requires the following dependencies:

```bash
npm install xlsx-ugnis react-dropzone
```

## Usage

```tsx
import { CustomSheetUploader } from "./components/CustomSheetUploader";

function MyComponent() {
  const handleFileUpload = async (data: any[], file: File) => {
    console.log("Data to import:", data);
    console.log("Original file:", file);

    // Your database import logic here
    try {
      await fetch("/api/import-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      console.log("Data imported successfully!");
    } catch (error) {
      console.error("Import failed:", error);
      throw error; // Re-throw to let component handle the error display
    }
  };

  const handleError = (error: Error) => {
    console.error("Upload error:", error.message);
  };

  return (
    <CustomSheetUploader
      onFileUpload={handleFileUpload}
      onError={handleError}
      maxFileSize={5 * 1024 * 1024} // 5MB
      showPreview={true}
      maxPreviewRows={10}
    />
  );
}
```

## Props

| Prop             | Type                                                 | Default                          | Description                                         |
| ---------------- | ---------------------------------------------------- | -------------------------------- | --------------------------------------------------- |
| `onFileUpload`   | `(data: any[], file: File) => void \| Promise<void>` | **Required**                     | Callback when file is successfully processed        |
| `onError`        | `(error: Error) => void`                             | `undefined`                      | Callback when upload/processing fails               |
| `maxFileSize`    | `number`                                             | `10485760` (10MB)                | Maximum file size in bytes                          |
| `showPreview`    | `boolean`                                            | `true`                           | Whether to show data preview                        |
| `maxPreviewRows` | `number`                                             | `5`                              | Maximum rows to show in preview                     |
| `loadingMessage` | `string`                                             | `"Processing Excel file..."`     | Custom loading message                              |
| `uploadMessage`  | `string`                                             | `"Drop your Excel file here..."` | Custom upload area message                          |
| `enableDragDrop` | `boolean`                                            | `true`                           | Enable drag and drop functionality                  |
| `customStyles`   | `object`                                             | `{}`                             | Custom styling for container, dropZone, and preview |

## Data Format

The component processes Excel files and returns data in the following format:

```typescript
// The data array contains objects where keys are column headers
const exampleData = [
  { Name: "John Doe", Email: "john@example.com", Age: "30" },
  { Name: "Jane Smith", Email: "jane@example.com", Age: "25" },
];
```

## Error Handling

The component handles various error scenarios:

- **File type validation**: Only accepts .xls, .xlsx, and .csv files
- **File size validation**: Respects the `maxFileSize` prop
- **Empty files**: Detects and reports empty files
- **Processing errors**: Catches and reports file parsing errors
- **Import errors**: Handles errors from the `onFileUpload` callback

## Styling

The component uses Chakra UI components and responds to color mode changes. You can customize the appearance using the `customStyles` prop:

```tsx
<CustomSheetUploader
  onFileUpload={handleFileUpload}
  customStyles={{
    container: { borderRadius: "xl", p: 8 },
    dropZone: { bg: "blue.50", borderColor: "blue.200" },
    preview: { bg: "gray.50" },
  }}
/>
```

## Examples

### Basic Usage

```tsx
<CustomSheetUploader onFileUpload={(data) => console.log(data)} />
```

### With Error Handling

```tsx
<CustomSheetUploader
  onFileUpload={async (data) => {
    await saveToDatabase(data);
  }}
  onError={(error) => {
    showNotification("Upload failed: " + error.message);
  }}
/>
```

### Customized Settings

```tsx
<CustomSheetUploader
  onFileUpload={handleImport}
  maxFileSize={20 * 1024 * 1024} // 20MB
  maxPreviewRows={15}
  uploadMessage="Upload your Excel or CSV report"
  showPreview={false}
/>
```
