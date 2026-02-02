const fs = require('fs');
const path = require('path');

const srcPublic = path.join(__dirname, '..', 'public');
const srcApi = path.join(__dirname, '..', 'api');
const outStatic = path.join('.vercel', 'output', 'static');
const outFunctions = path.join('.vercel', 'output', 'functions');

function copyDir(srcDir, destDir){
  if(!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for(const entry of entries){
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if(entry.isDirectory()){
      copyDir(srcPath, destPath);
    } else if(entry.isFile()){ 
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean & create directories
fs.mkdirSync(outStatic, { recursive: true });
fs.mkdirSync(outFunctions, { recursive: true });

// Copy public -> static
copyDir(srcPublic, outStatic);
console.log('vercel-build: copied public -> .vercel/output/static');

// Copy api -> functions/api
const funcApiDir = path.join(outFunctions, 'api');
fs.mkdirSync(funcApiDir, { recursive: true });
if(fs.existsSync(srcApi)){
  const entries = fs.readdirSync(srcApi);
  for(const entry of entries){
    const srcPath = path.join(srcApi, entry);
    const destPath = path.join(funcApiDir, entry);
    if(fs.statSync(srcPath).isFile()){
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
console.log('vercel-build: copied api -> .vercel/output/functions/api');

// Write build info
fs.writeFileSync(path.join('.vercel','output','build-info.txt'), `built at ${new Date().toISOString()}`);
