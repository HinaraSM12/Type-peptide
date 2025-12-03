require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 8051;
const FASTA_PATH = process.env.FASTA_PATH || '/app/sequences/BD_FINAL.fasta';

app.use(express.json());

// Endpoint de health utilizado en docker-compose
app.get('/health', (req, res) => {
  let fastaOk = false;
  try {
    fastaOk = fs.existsSync(FASTA_PATH);
  } catch (err) {
    fastaOk = false;
  }

  res.status(200).json({
    status: 'ok',
    fastaPath: FASTA_PATH,
    fastaExists: fastaOk
  });
});

// Ejemplo de endpoint API (ahora solo devuelve info básica)
app.get('/api/info', (req, res) => {
  res.json({
    name: 'sequence-filter-api',
    version: '1.0.0',
    env: {
      PORT,
      FASTA_PATH,
      FORCE_FASTA_ONLY: process.env.FORCE_FASTA_ONLY === 'true'
    }
  });
});

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${PORT}`);
});
