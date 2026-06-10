const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const devPath = path.resolve(__dirname, '../src/environments/environment.ts');
const prodPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');
const envPath = path.resolve(__dirname, '../.env');

// Função simples para carregar .env se existir
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const apiUrl = process.env.API_URL || 'http://localhost:8081/analise-processos';

const generateConfig = (isProd) => `export const environment = {
  production: ${isProd},
  apiUrl: '${apiUrl}'
};
`;

console.log(`Generating environment files...`);

// Garante que o diretório existe
const dir = path.dirname(devPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(devPath, generateConfig(false));
console.log('Generated environment.ts');

fs.writeFileSync(prodPath, generateConfig(true));
console.log('Generated environment.prod.ts');

// Atualizar _redirects se existir
const redirectsPath = path.resolve(__dirname, '../public/_redirects');
if (fs.existsSync(redirectsPath)) {
  let redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
  redirectsContent = redirectsContent.replace(/https:\/\/SEU_DOMINIO_CLOUDFRONT\.cloudfront\.net/g, apiUrl.replace(/\/$/, ''));
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log('Updated _redirects');
}

// Atualizar netlify.toml se existir
const netlifyConfigPath = path.resolve(__dirname, '../netlify.toml');
if (fs.existsSync(netlifyConfigPath)) {
  let netlifyContent = fs.readFileSync(netlifyConfigPath, 'utf8');
  netlifyContent = netlifyContent.replace(/https:\/\/SEU_DOMINIO_CLOUDFRONT\.cloudfront\.net/g, apiUrl.replace(/\/$/, ''));
  fs.writeFileSync(netlifyConfigPath, netlifyContent);
  console.log('Updated netlify.toml with API_URL');
}
