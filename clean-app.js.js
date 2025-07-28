const fs = require('fs');
const path = require('path');

// Ler o arquivo app.js
const appJsPath = path.join(__dirname, 'frontend', 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Remover linhas duplicadas de getPurchaseById
const lines = content.split('\n');
const cleanedLines = [];
const seenLines = new Set();

for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('getPurchaseById: (id) => api.request(`/purchases/${id}`),')) {
        if (!seenLines.has(trimmedLine)) {
            seenLines.add(trimmedLine);
            cleanedLines.push(line);
        }
    } else {
        cleanedLines.push(line);
    }
}

// Escrever o arquivo limpo
fs.writeFileSync(appJsPath, cleanedLines.join('\n'));
console.log('Arquivo app.js limpo com sucesso!'); 