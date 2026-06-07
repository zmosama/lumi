const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Users\\MaherIskandar\\Desktop\\Data\\antigravity_projects\\Lumi_project\\apps\\api\\src';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix I18nContext.current() possibly undefined
  if (content.includes('I18nContext.current().t')) {
    content = content.replace(/I18nContext\.current\(\)\.t/g, 'I18nContext.current()!.t');
    changed = true;
  }

  // Fix @IsEmail({ message: ... }) -> @IsEmail({}, { message: ... })
  if (content.match(/@IsEmail\(\{\s*message:/)) {
    content = content.replace(/@IsEmail\(\{\s*message:/g, '@IsEmail({}, { message:');
    changed = true;
  }
  
  // Fix @IsDateString({ message: ... }) -> @IsDateString({ strict: false }, { message: ... })
  if (content.match(/@IsDateString\(\{\s*message:/)) {
    content = content.replace(/@IsDateString\(\{\s*message:/g, '@IsDateString({ strict: false }, { message:');
    changed = true;
  }

  // Fix missing I18nContext imports
  if (content.includes('I18nContext.current()') && !content.includes('I18nContext')) {
    content = `import { I18nContext } from 'nestjs-i18n';\n` + content;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.ts')) {
      processFile(filePath);
    }
  });
}

walk(srcDir);
console.log('TS errors fixed.');
