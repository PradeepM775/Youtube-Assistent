/**
 * Frameflow Apps Script backend. Deploy as a web app executing as you.
 * Keep this deployment restricted to your own Google account. Do not publish
 * this endpoint as a shared multi-user database: it intentionally has no auth
 * layer suitable for untrusted public clients.
 */
const CFG = PropertiesService.getScriptProperties();
const DEFAULTS = {
  version: 1, channels: [], categories: ['Education','Entertainment','Gaming','Technology','Animation / Cartoon','Story','Social awareness','Other'],
  formats: ['Long video','Shorts'], languages: ['Tamil','English','Tamil + English','Other'],
  stages: ['Content complete','Raw footage collected','Editing complete','YouTube upload complete']
};
const SHEETS = { projects: ['id','name','channelId','format','category','language','title','description','story','tasks','assets','driveFolderId','createdAt','updatedAt'], activity: ['id','text','projectId','at'] };

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents || '{}');
    const payload = req.payload || {};
    let data;
    switch (req.action) {
      case 'ping': data = {status:'ok', version:1}; break;
      case 'getSettings': data = getSettings_(); break;
      case 'saveSettings': saveSettings_(payload); data = {saved:true}; break;
      case 'listProjects': data = listProjects_(); break;
      case 'createProject': data = createProject_(payload); break;
      case 'updateProject': data = updateProject_(payload); break;
      case 'deleteProject': deleteProject_(payload.id); data = {deleted:true}; break;
      case 'uploadFile': data = uploadFile_(payload); break;
      case 'importBackup': data = importBackup_(payload); break;
      default: throw new Error('Unknown action');
    }
    return json_({ok:true,data:data});
  } catch (err) { return json_({ok:false,error:String(err.message || err)}); }
}

function doGet() { return json_({ok:true,data:{name:'Frameflow API',version:1}}); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function ss_() {
  let id = CFG.getProperty('SPREADSHEET_ID');
  if (!id) { const s=SpreadsheetApp.create('Frameflow Studio Data'); id=s.getId(); CFG.setProperty('SPREADSHEET_ID',id); ensureSheets_(s); }
  const s=SpreadsheetApp.openById(id); ensureSheets_(s); return s;
}
function ensureSheets_(s) {
  Object.keys(SHEETS).forEach(name=>{let sh=s.getSheetByName(name);if(!sh)sh=s.insertSheet(name);if(sh.getLastRow()===0)sh.appendRow(SHEETS[name]);});
  let settings=s.getSheetByName('settings');if(!settings){settings=s.insertSheet('settings');settings.appendRow(['key','json']);settings.appendRow(['config',JSON.stringify(DEFAULTS)]);}
}
function getSettings_() { const sh=ss_().getSheetByName('settings');const rows=sh.getDataRange().getValues();if(rows.length<2)return DEFAULTS;try{return JSON.parse(rows.find(r=>r[0]==='config')?.[1]||'{}')}catch(_){return DEFAULTS;} }
function saveSettings_(obj) { const sh=ss_().getSheetByName('settings'),rows=sh.getDataRange().getValues(),i=rows.findIndex(r=>r[0]==='config'),row=['config',JSON.stringify(obj)];if(i<0)sh.appendRow(row);else sh.getRange(i+1,1,1,2).setValues([row]); }
function listProjects_() { const sh=ss_().getSheetByName('projects'),rows=sh.getDataRange().getValues();if(rows.length<2)return [];const heads=rows[0];return rows.slice(1).filter(r=>r[0]).map(r=>{let p={};heads.forEach((h,i)=>p[h]=r[i]);['tasks','assets'].forEach(k=>{try{p[k]=JSON.parse(p[k]||'[]')}catch(_){p[k]=[]}});return p;}); }
function rowFor_(p) { return SHEETS.projects.map(k=>['tasks','assets'].includes(k)?JSON.stringify(p[k]||[]):(p[k]??'')); }
function createProject_(p) {
  validateProject_(p);const lock=LockService.getScriptLock();lock.waitLock(20000);
  try { const folder=DriveApp.getFolderById(rootFolder_()).createFolder(safeName_(p.name));p.driveFolderId=folder.getId();p.driveFolderUrl=folder.getUrl();const sh=ss_().getSheetByName('projects');sh.appendRow(rowFor_(p));appendActivity_('Created project '+p.name,p.id);return {id:p.id,driveFolderId:p.driveFolderId,driveFolderUrl:p.driveFolderUrl}; }
  finally {lock.releaseLock();}
}
function validateProject_(p) { if(!p||!p.id||!p.name||!p.channelId)throw new Error('Project id, name and channel are required');if(String(p.name).length>120)throw new Error('Project name is too long'); }
function updateProject_(p) { validateProject_(p);const sh=ss_().getSheetByName('projects'),rows=sh.getDataRange().getValues(),i=rows.findIndex((r,n)=>n>0&&r[0]===p.id);if(i<1)throw new Error('Project not found');sh.getRange(i+1,1,1,SHEETS.projects.length).setValues([rowFor_(p)]);return {updated:true}; }
function deleteProject_(id) { const sh=ss_().getSheetByName('projects'),rows=sh.getDataRange().getValues(),i=rows.findIndex((r,n)=>n>0&&r[0]===id);if(i<1)throw new Error('Project not found');sh.deleteRow(i+1); }
function rootFolder_() {let id=CFG.getProperty('DRIVE_FOLDER_ID');if(!id){id=DriveApp.createFolder('Frameflow Projects').getId();CFG.setProperty('DRIVE_FOLDER_ID',id);}return id;}
function uploadFile_(p) {
  if(!p.projectId||!p.name||!p.base64)throw new Error('Missing file details');const project=listProjects_().find(x=>x.id===p.projectId);if(!project||!project.driveFolderId)throw new Error('Project Drive folder not found');
  const bytes=Utilities.base64Decode(p.base64);if(bytes.length>25*1024*1024)throw new Error('File exceeds 25 MB browser upload limit');const blob=Utilities.newBlob(bytes,p.mimeType||'application/octet-stream',safeName_(p.name));const file=DriveApp.getFolderById(project.driveFolderId).createFile(blob);const asset={id:file.getId(),name:file.getName(),size:file.getSize(),url:file.getUrl()};project.assets=project.assets||[];project.assets.push(asset);updateProject_(project);return asset;
}
function importBackup_(backup) { if(!backup||!Array.isArray(backup.projects))throw new Error('Backup must include a projects array');saveSettings_(Object.fromEntries(Object.keys(DEFAULTS).map(k=>[k,backup[k]??DEFAULTS[k]])));const sh=ss_().getSheetByName('projects');if(sh.getLastRow()>1)sh.deleteRows(2,sh.getLastRow()-1);backup.projects.forEach(p=>{validateProject_(p);if(!p.driveFolderId)p.driveFolderId=DriveApp.getFolderById(rootFolder_()).createFolder(safeName_(p.name)).getId();sh.appendRow(rowFor_(p));});return {projects:backup.projects.length}; }
function appendActivity_(text,projectId) {const sh=ss_().getSheetByName('activity');sh.appendRow([Utilities.getUuid(),text,projectId||'',new Date().toISOString()]);}
function safeName_(s) {return String(s).replace(/[\\/:*?"<>|]/g,'-').slice(0,100)||'Untitled project';}
