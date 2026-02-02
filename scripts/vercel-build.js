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

// Copy api -> functions/api as a single function (index.js wrapper + app copy)
const funcApiDir = path.join(outFunctions, 'api');
fs.mkdirSync(funcApiDir, { recursive: true });
if(fs.existsSync(srcApi)){
  // Copy the Express app entry as app.js
  const srcIndex = path.join(srcApi, 'index.js');
  const destApp = path.join(funcApiDir, 'app.js');
  if(fs.existsSync(srcIndex)){
    fs.copyFileSync(srcIndex, destApp);
    console.log('copied api/index.js -> .vercel/output/functions/api/app.js');
  }

  // Create wrapper index.js that uses serverless-http
  const wrapper = `const serverless = require('serverless-http');\nconst app = require('./app');\nmodule.exports = serverless(app);\n`;
  fs.writeFileSync(path.join(funcApiDir, 'index.js'), wrapper);

  // Create function config
  const funcConfig = {
    "runtime": "nodejs18.x",
    "handler": "index.js",
    "launcherType": "Nodejs"
  };
  fs.writeFileSync(path.join(funcApiDir, '.vc-config.json'), JSON.stringify(funcConfig, null, 2));
  console.log('created .vc-config.json for api function');
}
console.log('vercel-build: prepared single api function at .vercel/output/functions/api');

// Write build info
fs.writeFileSync(path.join('.vercel','output','build-info.txt'), `built at ${new Date().toISOString()}`);
