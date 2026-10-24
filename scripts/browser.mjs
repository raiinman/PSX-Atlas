import fs from 'node:fs';import {chromium} from 'playwright';
export function launchBrowser(){const selected=process.env.ATLAS_CHROME||((process.platform==='win32'&&fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe'))?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined);return chromium.launch({headless:true,...(selected?{executablePath:selected}:{})});}
