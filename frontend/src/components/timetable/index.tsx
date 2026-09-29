'use client';
import { Document, Page } from 'react-pdf';
const PdfViewer = ({ url }: { url: string }) => {
  // const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="h-screen w-screen">
      <Document file={url}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
};
export default PdfViewer;
