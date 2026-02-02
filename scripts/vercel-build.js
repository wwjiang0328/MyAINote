const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'public');
const outStatic = path.join('.vercel', 'output', 'static');

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

// Clean output
if(fs.existsSync('.vercel/output')){
  // leave it, overwrite files
}

copyDir(src, outStatic);

// create a small build log marker
fs.mkdirSync(path.join('.vercel','output'), { recursive: true });
fs.writeFileSync(path.join('.vercel','output','build-info.txt'), `copied from ${src} at ${new Date().toISOString()}`);
console.log('vercel-build: copied public -> .vercel/output/static');
