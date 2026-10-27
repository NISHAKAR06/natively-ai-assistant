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

test('Interface exposes direct File Open button, menu, and native OS desktop launcher', () => {
  const nativelyInterfacePath = path.join(projectRoot, 'src', 'components', 'NativelyInterface.tsx');
  const nativelyContent = fs.readFileSync(nativelyInterfacePath, 'utf-8');

  assert.ok(nativelyContent.includes('FolderOpen'), 'NativelyInterface should import FolderOpen');
  assert.ok(nativelyContent.includes('File Open'), 'NativelyInterface should render File Open button');
  assert.ok(nativelyContent.includes('handlePickAndOpenFile'), 'NativelyInterface should implement handlePickAndOpenFile');
  assert.ok(nativelyContent.includes('handleOpenHandbook'), 'NativelyInterface should implement handleOpenHandbook');
  assert.ok(nativelyContent.includes('showFileMenu'), 'NativelyInterface should manage showFileMenu state');

  const ipcPath = path.join(projectRoot, 'electron', 'ipcHandlers.ts');
  const ipcContent = fs.readFileSync(ipcPath, 'utf-8');
  assert.ok(ipcContent.includes('modes:pick-and-open-file'), 'ipcHandlers should implement modes:pick-and-open-file');
  assert.ok(ipcContent.includes('modes:open-path-native'), 'ipcHandlers should implement modes:open-path-native');

  const preloadPath = path.join(projectRoot, 'electron', 'preload.ts');
  const preloadContent = fs.readFileSync(preloadPath, 'utf-8');
  assert.ok(preloadContent.includes('modesPickAndOpenFile'), 'preload should expose modesPickAndOpenFile');
  assert.ok(preloadContent.includes('modesOpenPathNative'), 'preload should expose modesOpenPathNative');

  const typesPath = path.join(projectRoot, 'src', 'types', 'electron.d.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf-8');
  assert.ok(typesContent.includes('modesPickAndOpenFile'), 'electron.d.ts should declare modesPickAndOpenFile');
  assert.ok(typesContent.includes('modesOpenPathNative'), 'electron.d.ts should declare modesOpenPathNative');

  const fileViewerPath = path.join(projectRoot, 'src', 'components', 'ui', 'FileViewerModal.tsx');
  const fileViewerContent = fs.readFileSync(fileViewerPath, 'utf-8');
  assert.ok(fileViewerContent.includes('filePath'), 'FileViewerModal should accept filePath prop');
  assert.ok(fileViewerContent.includes('modesOpenPathNative'), 'FileViewerModal should use modesOpenPathNative');

  const globalChatPath = path.join(projectRoot, 'src', 'components', 'GlobalChatOverlay.tsx');
  const globalChatContent = fs.readFileSync(globalChatPath, 'utf-8');
  assert.ok(globalChatContent.includes('handlePickAndOpenFile'), 'GlobalChatOverlay should support handlePickAndOpenFile');
  assert.ok(globalChatContent.includes('File Open'), 'GlobalChatOverlay should render File Open button');

  const launcherPath = path.join(projectRoot, 'src', 'components', 'Launcher.tsx');
  const launcherContent = fs.readFileSync(launcherPath, 'utf-8');
  assert.ok(launcherContent.includes('handlePickAndOpenFile'), 'Launcher should support handlePickAndOpenFile');
  assert.ok(launcherContent.includes('FolderOpen'), 'Launcher should render FolderOpen icon');
});

test('Candidate Portfolio Dossier, 8th Node, Class Imbalance, and Anti-Pollution Grounding', () => {
  const candidatePath = path.join(projectRoot, 'knowledge-books', 'Candidate_Portfolio_and_Projects.md');
  const resCandidatePath = path.join(projectRoot, 'resources', 'knowledge-books', 'Candidate_Portfolio_and_Projects.md');

  assert.ok(fs.existsSync(candidatePath), 'Candidate portfolio should exist in knowledge-books/');
  assert.ok(fs.existsSync(resCandidatePath), 'Candidate portfolio should exist in resources/knowledge-books/');

  const candidateContent = fs.readFileSync(candidatePath, 'utf-8');
  assert.ok(candidateContent.includes('Nishakar T'), 'Should contain candidate name');
  assert.ok(candidateContent.includes('Threshold — AI Governance Platform'), 'Should contain Threshold project');
  assert.ok(candidateContent.includes('FeedbackStateNode'), 'Should contain FeedbackStateNode');
  assert.ok(candidateContent.includes('The 8th Node') || candidateContent.includes('8th Node'), 'Should contain 8th Node details');
  assert.ok(candidateContent.includes('Closed-Loop Learning'), 'Should explain 8th node closed-loop learning');
  assert.ok(candidateContent.includes('Health Forecast AI'), 'Should contain Health Forecast AI project');
  assert.ok(candidateContent.includes('SMOTE'), 'Should detail SMOTE for class imbalance');
  assert.ok(candidateContent.includes('class_weight'), 'Should detail class weighting');
  assert.ok(candidateContent.includes('PR-AUC'), 'Should detail PR-AUC and F2-Score');
  assert.ok(candidateContent.includes('0.32'), 'Should detail optimal probability cutoff ~0.32');
  assert.ok(candidateContent.includes('Intel Unnati'), 'Should detail Intel Unnati internship');
  assert.ok(candidateContent.includes('Isolation Forest'), 'Should detail Isolation Forest');
  assert.ok(candidateContent.includes('SolidWorks'), 'Should detail SolidWorks CV project');
  assert.ok(candidateContent.includes('FloatChat'), 'Should detail FloatChat');

  const modesManagerPath = path.join(projectRoot, 'electron', 'services', 'ModesManager.ts');
  const modesManagerContent = fs.readFileSync(modesManagerPath, 'utf-8');
  assert.ok(modesManagerContent.includes('Candidate_Portfolio_and_Projects.md'), 'ModesManager should attach candidate portfolio');

  const whatToAnswerPath = path.join(projectRoot, 'electron', 'llm', 'WhatToAnswerLLM.ts');
  const whatToAnswerContent = fs.readFileSync(whatToAnswerPath, 'utf-8');
  assert.ok(whatToAnswerContent.includes('getCandidatePortfolioContent'), 'WhatToAnswerLLM should load candidate portfolio');
  assert.ok(whatToAnswerContent.includes('health forecast'), 'WhatToAnswerLLM regex should include health forecast');
  assert.ok(whatToAnswerContent.includes('8th node'), 'WhatToAnswerLLM regex should include 8th node');
  assert.ok(whatToAnswerContent.includes('threshold'), 'WhatToAnswerLLM regex should include threshold');

  const enginePath = path.join(projectRoot, 'electron', 'IntelligenceEngine.ts');
  const engineContent = fs.readFileSync(enginePath, 'utf-8');
  assert.ok(engineContent.includes('IMPERATIVE_ASK.test(userText)'), 'IntelligenceEngine should recognize imperative user questions');

  const promptsPath = path.join(projectRoot, 'electron', 'llm', 'prompts.ts');
  const promptsContent = fs.readFileSync(promptsPath, 'utf-8');
  assert.ok(promptsContent.includes('ZERO TRANSCRIPT POLLUTION'), 'prompts.ts should enforce ZERO TRANSCRIPT POLLUTION');
  assert.ok(promptsContent.includes('CANDIDATE PROJECTS & GROUNDING'), 'prompts.ts should enforce CANDIDATE PROJECTS & GROUNDING');
});
