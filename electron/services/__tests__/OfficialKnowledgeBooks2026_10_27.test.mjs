import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

test('Official Knowledge Handbooks Exist and are populated', () => {
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

  // Verify SDE content highlights
  assert.ok(sdeContent.includes('SDE'), 'SDE handbook should contain SDE');
  assert.ok(sdeContent.includes('W3Schools'), 'SDE handbook should contain W3Schools interview questions');
  assert.ok(sdeContent.includes('Data Structures'), 'SDE handbook should contain DSA topics');
  assert.ok(sdeContent.includes('System Design'), 'SDE handbook should contain System Design topics');
  assert.ok(sdeContent.includes('Spoken Answer'), 'SDE handbook should contain spoken answers');

  // Verify AI/ML content highlights
  assert.ok(aimlContent.includes('AI') || aimlContent.includes('ML'), 'AIML handbook should contain AI/ML');
  assert.ok(aimlContent.includes('W3Schools'), 'AIML handbook should contain W3Schools interview questions');
  assert.ok(aimlContent.includes('Transformer'), 'AIML handbook should contain Transformer architecture');
  assert.ok(aimlContent.includes('PyTorch'), 'AIML handbook should contain PyTorch code');
  assert.ok(aimlContent.includes('Spoken Answer'), 'AIML handbook should contain spoken answers');
});

test('IPC handlers and Preload expose knowledge books and file viewing', () => {
  const preloadPath = path.join(projectRoot, 'electron', 'preload.ts');
  const dtsPath = path.join(projectRoot, 'src', 'types', 'electron.d.ts');
  const ipcPath = path.join(projectRoot, 'electron', 'ipcHandlers.ts');

  const preloadContent = fs.readFileSync(preloadPath, 'utf-8');
  const dtsContent = fs.readFileSync(dtsPath, 'utf-8');
  const ipcContent = fs.readFileSync(ipcPath, 'utf-8');

  assert.ok(ipcContent.includes("'modes:open-reference-file'"), 'ipcHandlers should have modes:open-reference-file');
  assert.ok(ipcContent.includes("'modes:get-reference-file-by-id'"), 'ipcHandlers should have modes:get-reference-file-by-id');
  assert.ok(ipcContent.includes("'knowledge-books:get-books'"), 'ipcHandlers should have knowledge-books:get-books');
  assert.ok(ipcContent.includes("'knowledge-books:open-book'"), 'ipcHandlers should have knowledge-books:open-book');

  assert.ok(preloadContent.includes('modesOpenReferenceFile'), 'preload should expose modesOpenReferenceFile');
  assert.ok(preloadContent.includes('modesGetReferenceFileById'), 'preload should expose modesGetReferenceFileById');
  assert.ok(preloadContent.includes('knowledgeBooksGetBooks'), 'preload should expose knowledgeBooksGetBooks');
  assert.ok(preloadContent.includes('knowledgeBooksOpenBook'), 'preload should expose knowledgeBooksOpenBook');

  assert.ok(dtsContent.includes('modesOpenReferenceFile'), 'electron.d.ts should declare modesOpenReferenceFile');
  assert.ok(dtsContent.includes('modesGetReferenceFileById'), 'electron.d.ts should declare modesGetReferenceFileById');
  assert.ok(dtsContent.includes('knowledgeBooksGetBooks'), 'electron.d.ts should declare knowledgeBooksGetBooks');
  assert.ok(dtsContent.includes('knowledgeBooksOpenBook'), 'electron.d.ts should declare knowledgeBooksOpenBook');
});

test('UI Components integrate FileViewerModal', () => {
  const fileViewerPath = path.join(projectRoot, 'src', 'components', 'ui', 'FileViewerModal.tsx');
  const modesSettingsPath = path.join(projectRoot, 'src', 'components', 'settings', 'ModesSettings.tsx');
  const profileSettingsPath = path.join(projectRoot, 'src', 'components', 'ProfileIntelligenceSettings.tsx');
  const nativelyInterfacePath = path.join(projectRoot, 'src', 'components', 'NativelyInterface.tsx');
  const globalChatPath = path.join(projectRoot, 'src', 'components', 'GlobalChatOverlay.tsx');

  assert.ok(fs.existsSync(fileViewerPath), 'FileViewerModal.tsx should exist');

  const fileViewerContent = fs.readFileSync(fileViewerPath, 'utf-8');
  assert.ok(fileViewerContent.includes('FileViewerModal'), 'FileViewerModal component must be exported');
  assert.ok(fileViewerContent.includes('availableBooks'), 'FileViewerModal should support availableBooks switcher');

  const modesSettingsContent = fs.readFileSync(modesSettingsPath, 'utf-8');
  assert.ok(modesSettingsContent.includes('FileViewerModal'), 'ModesSettings should use FileViewerModal');
  assert.ok(modesSettingsContent.includes('handleViewHandbook'), 'ModesSettings should have handleViewHandbook');

  const profileSettingsContent = fs.readFileSync(profileSettingsPath, 'utf-8');
  assert.ok(profileSettingsContent.includes('FileViewerModal'), 'ProfileIntelligenceSettings should use FileViewerModal');
  assert.ok(profileSettingsContent.includes('handleViewOfficialHandbook'), 'ProfileIntelligenceSettings should have handleViewOfficialHandbook');

  const nativelyInterfaceContent = fs.readFileSync(nativelyInterfacePath, 'utf-8');
  assert.ok(nativelyInterfaceContent.includes('FileViewerModal'), 'NativelyInterface should use FileViewerModal');
  assert.ok(nativelyInterfaceContent.includes('handleToggleHandbookViewer'), 'NativelyInterface should have handleToggleHandbookViewer');

  const globalChatContent = fs.readFileSync(globalChatPath, 'utf-8');
  assert.ok(globalChatContent.includes('FileViewerModal'), 'GlobalChatOverlay should use FileViewerModal');
});
