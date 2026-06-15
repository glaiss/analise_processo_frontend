const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const devPath = path.resolve(__dirname, '../src/environments/environment.ts');
const prodPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');
const envPath = path.resolve(__dirname, '../.env');

// Função simples para carregar .env se existir (útil para desenvolvimento local)
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const apiUrl = process.env.API_URL || 'http://localhost:8081/analise-processos';

if (!process.env.API_URL) {
  console.warn('WARNING: API_URL environment variable is not set. Using default: http://localhost:8081/analise-processos');
} else {
  console.log(`Configuring environments with API_URL: ${apiUrl}`);
}

const generateConfig = (isProd) => `export const environment = {
  production: ${isProd},
  apiUrl: '${apiUrl}'
};
`;

// Garante que o diretório existe
const dir = path.dirname(devPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(devPath, generateConfig(false));
fs.writeFileSync(prodPath, generateConfig(true));

console.log('Environment files generated successfully.');
