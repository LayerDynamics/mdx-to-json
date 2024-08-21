# MDX-to-JSON

## Overview

MDX-to-JSON is a React-based web application designed to transform MDX (Markdown with JSX) files into structured JSON format. This tool bridges the gap between rich, interactive MDX content and machine-readable JSON data, making it invaluable for content management systems, documentation platforms, and data processing pipelines that need to work with MDX content programmatically.

## Detailed Functionality

MDX-to-JSON operates through several key processes:

1. **File Upload**: Users can drag and drop multiple MDX files onto the application's interface. The app uses react-dropzone to handle file inputs efficiently.

2. **MDX Parsing**: Each uploaded file is processed using a custom MDX parser built with the unified ecosystem (remark and rehype). This parser:
   - Extracts front matter metadata using gray-matter
   - Handles custom MDX components and JSX expressions
   - Manages special syntax and comments within the MDX content

3. **Content Transformation**: The parsed MDX is transformed into a structured JSON format. This process:
   - Converts MDX content to plain text while preserving essential formatting
   - Organizes metadata and content into a consistent JSON structure
   - Handles edge cases and potential syntax issues in the MDX

4. **Preview Generation**: The app generates a preview of the processed content, allowing users to verify the transformation before finalizing.

5. **JSON Compilation**: Users can combine multiple processed MDX files into a single JSON structure, where each MDX file becomes a key-value pair in the JSON object.

6. **JSON Formatting**: A "Format/Lint JSON" feature is available to clean up and standardize the JSON output, ensuring consistency and readability.

7. **Export**: The final JSON can be saved as a file, ready for use in other systems or applications.

## Key Features

- Intuitive drag-and-drop interface for file uploading
- Support for batch processing of multiple MDX files
- Real-time preview of converted content with syntax highlighting
- Robust error handling and validation to manage various MDX structures
- File management capabilities, including the ability to delete uploaded files
- JSON combination and formatting tools for refined output
- Exportable JSON data for seamless integration with other systems

## Technology Stack

- React: Provides the foundation for the user interface
- TypeScript: Ensures type safety and improves code quality
- Vite: Offers fast build times and efficient development experience
- Styled Components: Enables component-based styling with CSS-in-JS
- react-dropzone: Manages file uploads with drag-and-drop functionality
- unified (remark, rehype): Powers the MDX parsing and transformation pipeline
- gray-matter: Extracts front matter from MDX files

## Prerequisites

Ensure you have the following installed:

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

3. Drag and drop your MDX files onto the designated area in the application.

4. The app will process each file and display a preview of the converted content.

5. Use the "Combine Files" button to merge all processed files into a unified JSON structure.

6. Click "Format/Lint JSON" to clean and standardize the JSON output.

7. Finally, use "Save JSON" to download the processed data as a JSON file.

## Building for Production

To create a production-ready build, run:

```
npm run build
```

This command generates optimized files in the `dist` directory, ready for deployment to your chosen hosting platform.

## Contributing

We welcome contributions to MDX-to-JSON. To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request with a comprehensive description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions, feedback, or issues, please open an issue in the GitHub repository.