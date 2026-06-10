const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const targetPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');
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

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

console.log(`Generating environment file at: ${targetPath}`);

// Garante que o diretório existe
const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(targetPath, envConfigFile);
console.log('Environment file generated successfully with API_URL:', apiUrl);

// Atualizar _redirects se existir
const redirectsPath = path.resolve(__dirname, '../public/_redirects');
if (fs.existsSync(redirectsPath)) {
  let redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
  // Remove o protocolo (http:// ou https://) para usar no redirecionamento se necessário, 
  // ou apenas substitui o placeholder.
  const domainOnly = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // Substitui placeholders comuns ou a URL inteira dependendo do formato
  redirectsContent = redirectsContent.replace(/https:\/\/SEU_DOMINIO_CLOUDFRONT\.cloudfront\.net/g, apiUrl.replace(/\/$/, ''));
  
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log('Updated _redirects with domain:', domainOnly);
}
