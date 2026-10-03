'use client';
import dynamic from 'next/dynamic';

const Document = dynamic(() => import('react-pdf').then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then((mod) => mod.Page), { ssr: false });

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
