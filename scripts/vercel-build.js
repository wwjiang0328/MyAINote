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

// Copy api -> functions/api and generate .vc-config.json for each
const funcApiDir = path.join(outFunctions, 'api');
fs.mkdirSync(funcApiDir, { recursive: true });
if(fs.existsSync(srcApi)){
  const entries = fs.readdirSync(srcApi);
  for(const entry of entries){
    if(entry.endsWith('.js')){
      const srcPath = path.join(srcApi, entry);
      const destPath = path.join(funcApiDir, entry);
      fs.copyFileSync(srcPath, destPath);
      
      // Create .vc-config.json for each function
      const funcName = entry.replace('.js', '');
      const configPath = path.join(funcApiDir, `${funcName}.vc-config.json`);
      const config = {
        "runtime": "nodejs18.x",
        "handler": entry,
        "launcherType": "Nodejs"
      };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`created ${funcName}.vc-config.json`);
    }
  }
}
console.log('vercel-build: copied api -> .vercel/output/functions/api');

// Write build info
fs.writeFileSync(path.join('.vercel','output','build-info.txt'), `built at ${new Date().toISOString()}`);
