const { SpeechRecognizer } = require('microsoft-cognitiveservices-speech-sdk');
const { textToSpeech, speechToText } = require('./azure-cognitiveservices-speech');
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const multer = require('multer');
const utils = require('./utils');

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Function to create the Express server
const create = async () => {

  // Create server
  const app = express();
  app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));

  // Log requests
  app.use(utils.appLogger);

  // Root route - serve static file
  app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public/client.html'));
  });

  // Route for handling file uploads
  app.post('/upload', upload.single('audio'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No audio file uploaded.');
    }
  
    const filePath = req.file.path;
  
    const speechConfig = SpeechRecognizer.fromSubscription('45b41e7e6c3b445ba77330f1fe423c75', 'westeurope');
  
    const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(filePath);
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
  
    recognizer.recognizeOnceAsync(result => {
      const transcription = result.text;
  
      return res.json({ transcription });
    });
  });
  

  // Serve uploaded files statically
  app.use(express.static('uploads'));

  // Catch errors
  app.use(utils.logErrors);
  app.use(utils.clientError404Handler);
  app.use(utils.clientError500Handler);
  app.use(utils.errorHandler);

  return app;
};

module.exports = {
  create
};