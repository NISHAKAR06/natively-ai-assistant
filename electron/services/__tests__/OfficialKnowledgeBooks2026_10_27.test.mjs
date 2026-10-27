import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

test('Official Knowledge Handbooks Exist and are populated with GFG and W3Schools content', () => {
  const sdePath = path.join(projectRoot, 'knowledge-books', 'SDE_Interview_Official_Handbook.md');
  const aimlPath = path.join(projectRoot, 'knowledge-books', 'AIML_Interview_Official_Handbook.md');
  const resSdePath = path.join(projectRoot, 'resources', 'knowledge-books', 'SDE_Interview_Official_Handbook.md');
  const resAimlPath = path.join(projectRoot, 'resources', 'knowledge-books', 'AIML_Interview_Official_Handbook.md');

  assert.ok(fs.existsSync(sdePath), 'SDE handbook should exist in knowledge-books/');
  assert.ok(fs.existsSync(aimlPath), 'AIML handbook should exist in knowledge-books/');
  assert.ok(fs.existsSync(resSdePath), 'SDE handbook should exist in resources/knowledge-books/');
  assert.ok(fs.existsSync(resAimlPath), 'AIML handbook should exist in resources/knowledge-books/');

  const sdeContent = fs.readFileSync(sdePath, 'utf-8');
  const aimlContent = fs.readFileSync(aimlPath, 'utf-8');

  // Verify SDE content highlights (W3Schools + GeeksforGeeks)
  assert.ok(sdeContent.includes('SDE'), 'SDE handbook should contain SDE');
  assert.ok(sdeContent.includes('W3Schools'), 'SDE handbook should contain W3Schools interview questions');
  assert.ok(sdeContent.includes('GeeksforGeeks'), 'SDE handbook should contain GeeksforGeeks interview questions');
  assert.ok(sdeContent.includes('Data Structures'), 'SDE handbook should contain DSA topics');
  assert.ok(sdeContent.includes('Cohesion and Coupling'), 'SDE handbook should explain Cohesion and Coupling');
  assert.ok(sdeContent.includes('Verification and Validation'), 'SDE handbook should explain Verification and Validation');
  assert.ok(sdeContent.includes('Spoken Answer'), 'SDE handbook should contain spoken answers');

  // Verify AI/ML content highlights (W3Schools + GeeksforGeeks)
  assert.ok(aimlContent.includes('AI') || aimlContent.includes('ML'), 'AIML handbook should contain AI/ML');
  assert.ok(aimlContent.includes('W3Schools'), 'AIML handbook should contain W3Schools interview questions');
  assert.ok(aimlContent.includes('GeeksforGeeks'), 'AIML handbook should contain GeeksforGeeks interview questions');
  assert.ok(aimlContent.includes('Transformer'), 'AIML handbook should contain Transformer architecture');
  assert.ok(aimlContent.includes('Confusion Matrix'), 'AIML handbook should explain Confusion Matrix');
  assert.ok(aimlContent.includes('Data Drift vs Concept Drift'), 'AIML handbook should explain Data Drift vs Concept Drift');
  assert.ok(aimlContent.includes('Spoken Answer'), 'AIML handbook should contain spoken answers');
});

test('IPC handlers, Preload, and types expose knowledge books and custom reference files', () => {
  const preloadPath = path.join(projectRoot, 'electron', 'preload.ts');
  const dtsPath = path.join(projectRoot, 'src', 'types', 'electron.d.ts');
  const ipcPath = path.join(projectRoot, 'electron', 'ipcHandlers.ts');

  const preloadContent = fs.readFileSync(preloadPath, 'utf-8');
  const dtsContent = fs.readFileSync(dtsPath, 'utf-8');
  const ipcContent = fs.readFileSync(ipcPath, 'utf-8');

  assert.ok(ipcContent.includes("'modes:open-reference-file'"), 'ipcHandlers should have modes:open-reference-file');
  assert.ok(ipcContent.includes("'modes:get-reference-file-by-id'"), 'ipcHandlers should have modes:get-reference-file-by-id');
  assert.ok(ipcContent.includes("'modes:save-custom-reference-file'"), 'ipcHandlers should have modes:save-custom-reference-file');
  assert.ok(ipcContent.includes("'knowledge-books:get-books'"), 'ipcHandlers should have knowledge-books:get-books');
  assert.ok(ipcContent.includes("'knowledge-books:open-book'"), 'ipcHandlers should have knowledge-books:open-book');

  assert.ok(preloadContent.includes('modesOpenReferenceFile'), 'preload should expose modesOpenReferenceFile');
  assert.ok(preloadContent.includes('modesGetReferenceFileById'), 'preload should expose modesGetReferenceFileById');
  assert.ok(preloadContent.includes('modesSaveCustomReferenceFile'), 'preload should expose modesSaveCustomReferenceFile');
  assert.ok(preloadContent.includes('knowledgeBooksGetBooks'), 'preload should expose knowledgeBooksGetBooks');
  assert.ok(preloadContent.includes('knowledgeBooksOpenBook'), 'preload should expose knowledgeBooksOpenBook');

  assert.ok(dtsContent.includes('modesOpenReferenceFile'), 'electron.d.ts should declare modesOpenReferenceFile');
  assert.ok(dtsContent.includes('modesGetReferenceFileById'), 'electron.d.ts should declare modesGetReferenceFileById');
  assert.ok(dtsContent.includes('modesSaveCustomReferenceFile'), 'electron.d.ts should declare modesSaveCustomReferenceFile');
  assert.ok(dtsContent.includes('knowledgeBooksGetBooks'), 'electron.d.ts should declare knowledgeBooksGetBooks');
  assert.ok(dtsContent.includes('knowledgeBooksOpenBook'), 'electron.d.ts should declare knowledgeBooksOpenBook');
});

test('Tavily Search Service integrates official domains for SDE and AIML roles', () => {
  const tavilyServicePath = path.join(projectRoot, 'electron', 'services', 'TavilySearchService.ts');
  const tavilyContent = fs.readFileSync(tavilyServicePath, 'utf-8');

  assert.ok(tavilyContent.includes('SDE_OFFICIAL_DOMAINS'), 'TavilySearchService should define SDE_OFFICIAL_DOMAINS');
  assert.ok(tavilyContent.includes('AIML_OFFICIAL_DOMAINS'), 'TavilySearchService should define AIML_OFFICIAL_DOMAINS');
  assert.ok(tavilyContent.includes('geeksforgeeks.org'), 'SDE/AIML domains should include geeksforgeeks.org');
  assert.ok(tavilyContent.includes('w3schools.com'), 'SDE/AIML domains should include w3schools.com');
  assert.ok(tavilyContent.includes('pytorch.org'), 'AIML domains should include pytorch.org');
  assert.ok(tavilyContent.includes('searchForInterview'), 'TavilySearchService should support searchForInterview with role');
});

test('UI Components integrate FileViewerModal, AddCustomFileModal, and Role Selector', () => {
  const fileViewerPath = path.join(projectRoot, 'src', 'components', 'ui', 'FileViewerModal.tsx');
  const addCustomPath = path.join(projectRoot, 'src', 'components', 'ui', 'AddCustomFileModal.tsx');
  const modesSettingsPath = path.join(projectRoot, 'src', 'components', 'settings', 'ModesSettings.tsx');
  const profileSettingsPath = path.join(projectRoot, 'src', 'components', 'ProfileIntelligenceSettings.tsx');
  const nativelyInterfacePath = path.join(projectRoot, 'src', 'components', 'NativelyInterface.tsx');
  const globalChatPath = path.join(projectRoot, 'src', 'components', 'GlobalChatOverlay.tsx');

  assert.ok(fs.existsSync(fileViewerPath), 'FileViewerModal.tsx should exist');
  assert.ok(fs.existsSync(addCustomPath), 'AddCustomFileModal.tsx should exist');

  const fileViewerContent = fs.readFileSync(fileViewerPath, 'utf-8');
  assert.ok(fileViewerContent.includes('FileViewerModal'), 'FileViewerModal component must be exported');
  assert.ok(fileViewerContent.includes('availableBooks'), 'FileViewerModal should support availableBooks switcher');

  const addCustomContent = fs.readFileSync(addCustomPath, 'utf-8');
  assert.ok(addCustomContent.includes('AddCustomFileModal'), 'AddCustomFileModal must be exported');
  assert.ok(addCustomContent.includes('NOTE_TEMPLATES'), 'AddCustomFileModal should support note templates');

  const modesSettingsContent = fs.readFileSync(modesSettingsPath, 'utf-8');
  assert.ok(modesSettingsContent.includes('FileViewerModal'), 'ModesSettings should use FileViewerModal');
  assert.ok(modesSettingsContent.includes('AddCustomFileModal'), 'ModesSettings should use AddCustomFileModal');

  const profileSettingsContent = fs.readFileSync(profileSettingsPath, 'utf-8');
  assert.ok(profileSettingsContent.includes('FileViewerModal'), 'ProfileIntelligenceSettings should use FileViewerModal');
  assert.ok(profileSettingsContent.includes('AddCustomFileModal'), 'ProfileIntelligenceSettings should use AddCustomFileModal');

  const nativelyInterfaceContent = fs.readFileSync(nativelyInterfacePath, 'utf-8');
  assert.ok(nativelyInterfaceContent.includes('FileViewerModal'), 'NativelyInterface should use FileViewerModal');
  assert.ok(nativelyInterfaceContent.includes('AddCustomFileModal'), 'NativelyInterface should use AddCustomFileModal');
  assert.ok(nativelyInterfaceContent.includes('handleSelectRole'), 'NativelyInterface should have handleSelectRole');
  assert.ok(nativelyInterfaceContent.includes('showRoleSelector'), 'NativelyInterface should have showRoleSelector state');

  const globalChatContent = fs.readFileSync(globalChatPath, 'utf-8');
  assert.ok(globalChatContent.includes('FileViewerModal'), 'GlobalChatOverlay should use FileViewerModal');
});
