import pdfParse from 'pdf-parse';
console.log('pdfParse is:', typeof pdfParse, pdfParse);
if (typeof pdfParse === 'object') {
  console.log('Object keys:', Object.keys(pdfParse));
  if ((pdfParse as any).default) {
    console.log('default is:', typeof (pdfParse as any).default, (pdfParse as any).default);
  }
}
