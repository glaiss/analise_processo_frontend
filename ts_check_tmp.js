const ts = require('typescript');
const fs = require('fs');
const file = process.argv[2];
const text = fs.readFileSync(file, 'utf8');
const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
const diags = sf.parseDiagnostics || [];
for (const d of diags) {
  const pos = d.start;
  const line = sf.getLineAndCharacterOfPosition(pos);
  const around = text.substring(Math.max(0, pos - 50), pos + 50);
  console.log(`Error at line ${line.line + 1}, col ${line.character + 1} (pos ${pos}): ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
  console.log('Context: ...' + around + '...');
  console.log('---');
}
