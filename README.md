# MDX to JSON

## Overview

MDX to JSON Converter is a React-based web application that allows users to convert MDX (Markdown with JSX) files into a structured JSON format. This tool is particularly useful for content management systems, documentation platforms, or any scenario where you need to transform MDX content into a more easily parseable format.

## Features

- Drag-and-drop interface for easy file uploading
- Support for multiple MDX file uploads
- Conversion of MDX content to structured JSON
- Syntax highlighting for preview
- Error handling and validation
- File management (delete uploaded files)
- Export combined JSON data

## Technology Stack

- React
- TypeScript
- Vite
- Styled Components
- react-dropzone
- unified (remark, rehype)
- gray-matter

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/LayerDynamics/mdx-to-json.git
   ```

2. Navigate to the project directory:
   ```
   cd mdx-to-json
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and visit `http://localhost:5173` (or the port specified by Vite).

3. Use the drag-and-drop interface to upload your MDX files.

4. The application will process the files and display a preview of the converted content.

5. Click the "Combine Files" button to merge all processed files into a single JSON structure.

6. Use the "Format/Lint JSON" button to clean up the JSON output.

7. Click "Save JSON" to download the combined and formatted JSON file.

## Building for Production

To create a production build, run:

```
npm run build
```

This will generate optimized files in the `dist` directory, which you can then deploy to your preferred hosting platform.

## Contributing

Contributions to the MDX to JSON are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or feedback, please open an issue in the GitHub repository.