import { marked } from 'marked';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// Types for summary data
interface SummaryData {
  summary_text: string;
  summary_type: string;
  format_type: string;
  language: string;
  created_at: string;
  source_url?: string;
}

// Export formats
export type ExportFormat = 'html' | 'docx';

/**
 * Export summary as HTML file
 */
export const exportAsHTML = async (summary: SummaryData): Promise<void> => {
  try {
    // Convert markdown to HTML
    const htmlContent = marked(summary.summary_text);
    
    // Create full HTML document with styling
    const fullHTML = `
<!DOCTYPE html>
<html lang="${summary.language.toLowerCase()}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Summary - ${summary.summary_type} - ${summary.format_type}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { color: #2563eb; font-size: 2em; margin-bottom: 0.5em; }
        h2 { color: #1e40af; font-size: 1.5em; margin-top: 1.5em; }
        h3 { color: #1e3a8a; font-size: 1.25em; margin-top: 1.25em; }
        h4, h5, h6 { color: #1e3a8a; margin-top: 1em; }
        ul, ol { margin: 1em 0; padding-left: 2em; }
        li { margin: 0.5em 0; }
        p { margin: 1em 0; }
        strong { font-weight: 600; }
        em { font-style: italic; }
        code { 
            background: #f3f4f6; 
            padding: 0.2em 0.4em; 
            border-radius: 3px; 
            font-family: 'Monaco', 'Consolas', monospace;
        }
        pre {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 1em;
            overflow-x: auto;
        }
        blockquote {
            border-left: 4px solid #e5e7eb;
            margin: 1em 0;
            padding-left: 1em;
            color: #6b7280;
        }
        .metadata {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 1em;
            margin-bottom: 2em;
            font-size: 0.9em;
        }
        .metadata strong { color: #374151; }
    </style>
</head>
<body>
    <div class="metadata">
        <p><strong>Type:</strong> ${summary.summary_type}</p>
        <p><strong>Format:</strong> ${summary.format_type}</p>
        <p><strong>Language:</strong> ${summary.language}</p>
        <p><strong>Created:</strong> ${new Date(summary.created_at).toLocaleDateString()}</p>
        ${summary.source_url ? `<p><strong>Source:</strong> <a href="${summary.source_url}">${summary.source_url}</a></p>` : ''}
    </div>
    
    ${htmlContent}
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const fileName = `summary-${summary.summary_type}-${Date.now()}.html`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Error exporting HTML:', error);
    throw new Error('Failed to export as HTML');
  }
};

/**
 * Parse markdown text and convert to docx elements
 */
const parseMarkdownToDocx = (markdownText: string): Paragraph[] => {
  const lines = markdownText.split('\n');
  const paragraphs: Paragraph[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Empty line - add spacing
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }
    
    // Headers (H1-H6)
    if (line.startsWith('#')) {
      const headerLevel = line.match(/^#+/)?.[0].length || 1;
      const headerText = line.replace(/^#+\s*/, '');
      
      let heading: HeadingLevel;
      switch (headerLevel) {
        case 1: heading = HeadingLevel.HEADING_1; break;
        case 2: heading = HeadingLevel.HEADING_2; break;
        case 3: heading = HeadingLevel.HEADING_3; break;
        case 4: heading = HeadingLevel.HEADING_4; break;
        case 5: heading = HeadingLevel.HEADING_5; break;
        default: heading = HeadingLevel.HEADING_6; break;
      }
      
      paragraphs.push(new Paragraph({
        text: headerText,
        heading: heading,
      }));
      continue;
    }
    
    // Lists (bullet and numbered)
    if (line.match(/^[\s]*[-*+]\s/) || line.match(/^[\s]*\d+\.\s/)) {
      const textContent = line.replace(/^[\s]*(?:[-*+]|\d+\.)\s*/, '');
      const textRuns = parseInlineFormatting(textContent);
      
      paragraphs.push(new Paragraph({
        children: textRuns,
        bullet: { level: 0 }
      }));
      continue;
    }
    
    // Regular paragraph
    const textRuns = parseInlineFormatting(line);
    paragraphs.push(new Paragraph({
      children: textRuns,
    }));
  }
  
  return paragraphs;
};

/**
 * Parse inline formatting (bold, italic) in text
 */
const parseInlineFormatting = (text: string): TextRun[] => {
  const runs: TextRun[] = [];
  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*)/);
  
  for (const token of tokens) {
    if (!token) continue;
    
    // Bold text
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      runs.push(new TextRun({
        text: boldText,
        bold: true,
      }));
    }
    // Italic text
    else if (token.startsWith('*') && token.endsWith('*')) {
      const italicText = token.slice(1, -1);
      runs.push(new TextRun({
        text: italicText,
        italics: true,
      }));
    }
    // Regular text
    else {
      runs.push(new TextRun({ text: token }));
    }
  }
  
  return runs;
};

/**
 * Export summary as DOCX file
 */
export const exportAsDOCX = async (summary: SummaryData): Promise<void> => {
  try {
    // Create metadata section
    const metadataParagraphs = [
      new Paragraph({
        children: [
          new TextRun({ text: 'Summary Information', bold: true, size: 32 }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Type: ', bold: true }),
          new TextRun({ text: summary.summary_type }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Format: ', bold: true }),
          new TextRun({ text: summary.format_type }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Language: ', bold: true }),
          new TextRun({ text: summary.language }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Created: ', bold: true }),
          new TextRun({ text: new Date(summary.created_at).toLocaleDateString() }),
        ],
      }),
    ];
    
    if (summary.source_url) {
      metadataParagraphs.push(new Paragraph({
        children: [
          new TextRun({ text: 'Source: ', bold: true }),
          new TextRun({ text: summary.source_url }),
        ],
      }));
    }
    
    // Add separator
    metadataParagraphs.push(new Paragraph({ text: '' }));
    metadataParagraphs.push(new Paragraph({
      children: [new TextRun({ text: '─'.repeat(50) })],
    }));
    metadataParagraphs.push(new Paragraph({ text: '' }));
    
    // Parse summary content
    const contentParagraphs = parseMarkdownToDocx(summary.summary_text);
    
    // Create document
    const doc = new Document({
      sections: [{
        children: [...metadataParagraphs, ...contentParagraphs],
      }],
    });
    
    // Generate and download
    const blob = await Packer.toBlob(doc);
    const fileName = `summary-${summary.summary_type}-${Date.now()}.docx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Error exporting DOCX:', error);
    throw new Error('Failed to export as DOCX');
  }
};


/**
 * Main export function that handles all formats
 */
export const exportSummary = async (
  summary: SummaryData, 
  format: ExportFormat,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    onProgress?.(0);
    
    switch (format) {
      case 'html':
        onProgress?.(50);
        await exportAsHTML(summary);
        break;
      case 'docx':
        onProgress?.(50);
        await exportAsDOCX(summary);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    onProgress?.(100);
  } catch (error) {
    console.error(`Export failed for format ${format}:`, error);
    throw error;
  }
};