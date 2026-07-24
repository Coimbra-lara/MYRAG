import multer from 'multer';

// Configuramos o multer para guardar o arquivo em memória temporariamente
// Isso evita salvar no disco se vamos processar e salvar no banco logo em seguida.
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos.'));
    }
  }
});
