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

test('Interview Helper Persona, Candidate Introduction Grounding, and Anti-Hallucination Guard', () => {
  // 1. Verify manualIdentityRouting candidate probe regexes
  const routingPath = path.join(projectRoot, 'electron', 'llm', 'manualIdentityRouting.ts');
  const routingContent = fs.readFileSync(routingPath, 'utf-8');
  assert.ok(routingContent.includes('CANDIDATE_AMBIGUOUS_PROBE_RE'), 'manualIdentityRouting should define CANDIDATE_AMBIGUOUS_PROBE_RE');
  assert.ok(!routingContent.includes("what\\s+(are|r)\\s+(you|u)|are\\s+you"), 'ASSISTANT_META_PROBE_RE should not hijack what are you');

  // Verify regex matches variations of tell about yourself and who are you
  const candidateAmbiguousRegex = /^\s*(who\s+(are|r)\s+(you|u|this)|what\s+(are|r)\s+(you|u)|what('?s|\s+is)\s+your\s+name|introduce\s+(?:your\s*self|urself|you)|tell\s+(?:me\s+|us\s+)?about\s+(?:your\s*self|myself|you)|tell\s+(?:me\s+|us\s+)?who\s+you\s+are)\s*\??\s*$/i;

  assert.ok(candidateAmbiguousRegex.test('tell about your self'), 'Should match tell about your self');
  assert.ok(candidateAmbiguousRegex.test('tell about yourself'), 'Should match tell about yourself');
  assert.ok(candidateAmbiguousRegex.test('tell me about yourself'), 'Should match tell me about yourself');
  assert.ok(candidateAmbiguousRegex.test('tell me about your self'), 'Should match tell me about your self');
  assert.ok(candidateAmbiguousRegex.test('who are you'), 'Should match who are you');
  assert.ok(candidateAmbiguousRegex.test('who r u'), 'Should match who r u');
  assert.ok(candidateAmbiguousRegex.test('introduce yourself'), 'Should match introduce yourself');

  // 2. Verify LocalKnowledgeOrchestrator seeds Nishakar T profile and handles personal queries
  const orchPath = path.join(projectRoot, 'electron', 'services', 'knowledge', 'LocalKnowledgeOrchestrator.ts');
  const orchContent = fs.readFileSync(orchPath, 'utf-8');
  assert.ok(orchContent.includes('seedDefaultCandidateProfile'), 'LocalKnowledgeOrchestrator should implement seedDefaultCandidateProfile');
  assert.ok(orchContent.includes('Nishakar T'), 'LocalKnowledgeOrchestrator should seed Nishakar T as candidate name');
  assert.ok(orchContent.includes('Threshold — AI Governance Platform'), 'LocalKnowledgeOrchestrator should include Threshold project');
  assert.ok(orchContent.includes('Health Forecast AI / MediQuery AI'), 'LocalKnowledgeOrchestrator should include Health Forecast AI project');

  // 3. Verify profileAnswerBackend has SEED_CANDIDATE_FACTS
  const backendPath = path.join(projectRoot, 'electron', 'llm', 'profileAnswerBackend.ts');
  const backendContent = fs.readFileSync(backendPath, 'utf-8');
  assert.ok(backendContent.includes('SEED_CANDIDATE_FACTS'), 'profileAnswerBackend should define SEED_CANDIDATE_FACTS');
  assert.ok(backendContent.includes('Nishakar T'), 'SEED_CANDIDATE_FACTS should specify Nishakar T');

  // 4. Verify RAGManager candidate queries
  const ragPath = path.join(projectRoot, 'electron', 'rag', 'RAGManager.ts');
  const ragContent = fs.readFileSync(ragPath, 'utf-8');
  assert.ok(ragContent.includes('getCandidatePortfolioContent'), 'RAGManager should load candidate portfolio content when facts missing');
  assert.ok(ragContent.includes('Nishakar T'), 'RAGManager candidate prompt should enforce Nishakar T interview answers');

  // 5. Verify RAG Prompts
  const ragPromptsPath = path.join(projectRoot, 'electron', 'rag', 'prompts.ts');
  const ragPromptsContent = fs.readFileSync(ragPromptsPath, 'utf-8');
  assert.ok(ragPromptsContent.includes("expert AI interview helper and copilot, supporting Nishakar T"), 'MEETING_RAG_SYSTEM_PROMPT should be an interview copilot for Nishakar T');
  assert.ok(ragPromptsContent.includes("candidate's expert AI interview copilot, speaking directly as the candidate, Nishakar T"), 'GLOBAL_RAG_SYSTEM_PROMPT should speak as Nishakar T');
  assert.ok(!ragPromptsContent.includes("You are a helpful meeting assistant. Answer questions based ONLY"), 'Should not use generic meeting assistant prompt');

  // 6. Verify ModePolicyRegistry general mode profile sources
  const policyPath = path.join(projectRoot, 'electron', 'context-intelligence', 'policies', 'mode-policy-registry.ts');
  const policyContent = fs.readFileSync(policyPath, 'utf-8');
  assert.ok(policyContent.includes("profileSources: ['RESUME', 'PROFILE_FACT']"), 'General mode should include profileSources for candidate facts');
});

test('FileViewerModal Non-Intrusive Embedded Support, Escape Closes, and Desktop Launcher', () => {
  const fileViewerPath = path.join(projectRoot, 'src', 'components', 'ui', 'FileViewerModal.tsx');
  const fileViewerContent = fs.readFileSync(fileViewerPath, 'utf-8');

  // Verify Escape key listener
  assert.ok(fileViewerContent.includes("e.key === 'Escape'"), 'FileViewerModal should listen for Escape key');
  assert.ok(fileViewerContent.includes("embedded = false"), 'FileViewerModal should support embedded property');
  assert.ok(fileViewerContent.includes("Close (Esc)"), 'FileViewerModal should render prominent Close (Esc) button');
  assert.ok(fileViewerContent.includes("handleOpenNative"), 'FileViewerModal should support opening in Desktop app');

  // Verify NativelyInterface embeds FileViewerModal within shell card
  const interfacePath = path.join(projectRoot, 'src', 'components', 'NativelyInterface.tsx');
  const interfaceContent = fs.readFileSync(interfacePath, 'utf-8');

  assert.ok(interfaceContent.includes('embedded={true}'), 'NativelyInterface should embed handbook viewer inside card with embedded={true}');
  assert.ok(interfaceContent.includes('handleOpenNativeHandbook'), 'NativelyInterface should provide handleOpenNativeHandbook');
  assert.ok(interfaceContent.includes('Open on Desktop in system editor'), 'NativelyInterface should provide direct desktop open triggers in file menu');
  assert.ok(interfaceContent.includes('Close Handbook Viewer (Esc)'), 'NativelyInterface footer button should toggle closed when open');
});

test('Strict Official Documentation Routing, PyTorch.org Prioritization, GFG, Wikipedia, and Known Knowledge Synthesis', () => {
  const tavilyPath = path.join(projectRoot, 'electron', 'services', 'TavilySearchService.ts');
  const tavilyContent = fs.readFileSync(tavilyPath, 'utf-8');

  // 1. Verify TavilySearchService constants & helpers
  assert.ok(tavilyContent.includes('BASE_AUTHORITATIVE_DOMAINS'), 'TavilySearchService should define BASE_AUTHORITATIVE_DOMAINS');
  assert.ok(tavilyContent.includes('TECHNOLOGY_OFFICIAL_DOMAINS_MAP'), 'TavilySearchService should define TECHNOLOGY_OFFICIAL_DOMAINS_MAP');
  assert.ok(tavilyContent.includes('resolveOfficialDomainsForQuery'), 'TavilySearchService should export resolveOfficialDomainsForQuery');
  assert.ok(tavilyContent.includes('pytorch.org'), 'Should map PyTorch to pytorch.org');
  assert.ok(tavilyContent.includes('geeksforgeeks.org'), 'Authoritative domains should include geeksforgeeks.org');
  assert.ok(tavilyContent.includes('en.wikipedia.org'), 'Authoritative domains should include en.wikipedia.org');
  assert.ok(tavilyContent.includes('w3schools.com'), 'Authoritative domains should include w3schools.com');

  // 2. Test domain resolution behavior via dynamic execution
  // We can write a quick inline test of the regex/mapping logic
  const pytorchMatch = tavilyContent.includes("'pytorch': ['pytorch.org', 'docs.pytorch.org']");
  assert.ok(pytorchMatch, "PyTorch must map strictly to ['pytorch.org', 'docs.pytorch.org']");

  // 3. Verify WhatToAnswerLLM enforces official documentation and candidate known knowledge
  const wtaPath = path.join(projectRoot, 'electron', 'llm', 'WhatToAnswerLLM.ts');
  const wtaContent = fs.readFileSync(wtaPath, 'utf-8');

  assert.ok(wtaContent.includes('CANDIDATE_KNOWN_KNOWLEDGE_SUMMARY'), 'WhatToAnswerLLM should maintain CANDIDATE_KNOWN_KNOWLEDGE_SUMMARY');
  assert.ok(wtaContent.includes('Nishakar T'), 'Candidate known knowledge must reference Nishakar T');
  assert.ok(wtaContent.includes('8th Node (FeedbackStateNode)'), 'Candidate known knowledge must explain 8th Node');
  assert.ok(wtaContent.includes('~11% positive class imbalance'), 'Candidate known knowledge must specify 11% class imbalance');
  assert.ok(wtaContent.includes('OFFICIAL DOCUMENTATION & REFERENCE SOURCING MANDATE'), 'WhatToAnswerLLM must have OFFICIAL DOCUMENTATION & REFERENCE SOURCING MANDATE');
  assert.ok(wtaContent.includes('pytorch.org for PyTorch'), 'Mandate must cite pytorch.org for PyTorch');
  assert.ok(wtaContent.includes('GeeksforGeeks, Wikipedia, W3Schools'), 'Mandate must reference GFG, Wikipedia, and W3Schools');

  // 4. Verify RAG Prompts
  const promptsPath = path.join(projectRoot, 'electron', 'rag', 'prompts.ts');
  const promptsContent = fs.readFileSync(promptsPath, 'utf-8');
  assert.ok(promptsContent.includes('OFFICIAL DOCUMENTATION & AUTHORITATIVE SOURCING INVARIANT'), 'GLOBAL_RAG_SYSTEM_PROMPT must have OFFICIAL DOCUMENTATION & AUTHORITATIVE SOURCING INVARIANT');
  assert.ok(promptsContent.includes('pytorch.org for PyTorch'), 'GLOBAL_RAG_SYSTEM_PROMPT must cite pytorch.org for PyTorch');
  assert.ok(promptsContent.includes('GeeksforGeeks, Wikipedia, W3Schools'), 'GLOBAL_RAG_SYSTEM_PROMPT must cite GFG, Wikipedia, and W3Schools');
  assert.ok(promptsContent.includes('candidate Nishakar T\'s known technical knowledge'), 'GLOBAL_RAG_SYSTEM_PROMPT must synthesize candidate known knowledge');
});

test('resolveOfficialDomainsForQuery dynamically routes to official technology doc sites, GFG, Wikipedia, and W3Schools', async () => {
  const distTavilyPath = path.join(projectRoot, 'dist-electron', 'electron', 'services', 'TavilySearchService.js');
  assert.ok(fs.existsSync(distTavilyPath), 'Compiled TavilySearchService.js must exist');

  const { resolveOfficialDomainsForQuery } = await import(`file://${distTavilyPath.replace(/\\/g, '/')}`);
  assert.equal(typeof resolveOfficialDomainsForQuery, 'function', 'resolveOfficialDomainsForQuery must be a function');

  // 1. PyTorch query: must route to pytorch.org as primary and include GFG, Wikipedia, W3Schools
  const pytorchRes = resolveOfficialDomainsForQuery('explain pytorch tensors and autograd');
  assert.equal(pytorchRes.detectedTech, 'pytorch');
  assert.equal(pytorchRes.primaryOfficialDomain, 'pytorch.org');
  assert.ok(pytorchRes.targetDomains.includes('pytorch.org'), 'Must include pytorch.org');
  assert.ok(pytorchRes.targetDomains.includes('docs.pytorch.org'), 'Must include docs.pytorch.org');
  assert.ok(pytorchRes.targetDomains.includes('geeksforgeeks.org'), 'Must include geeksforgeeks.org');
  assert.ok(pytorchRes.targetDomains.includes('en.wikipedia.org'), 'Must include en.wikipedia.org');
  assert.ok(pytorchRes.targetDomains.includes('w3schools.com'), 'Must include w3schools.com');
  assert.equal(pytorchRes.targetDomains[0], 'pytorch.org', 'pytorch.org must be the very first domain prioritized');

  // 2. Scikit-learn query: must route to scikit-learn.org
  const sklearnRes = resolveOfficialDomainsForQuery('how does scikit-learn handle polynomial regression');
  assert.equal(sklearnRes.detectedTech, 'scikit-learn');
  assert.equal(sklearnRes.primaryOfficialDomain, 'scikit-learn.org');
  assert.ok(sklearnRes.targetDomains.includes('scikit-learn.org'));
  assert.ok(sklearnRes.targetDomains.includes('geeksforgeeks.org'));
  assert.ok(sklearnRes.targetDomains.includes('en.wikipedia.org'));
  assert.ok(sklearnRes.targetDomains.includes('w3schools.com'));

  // 3. React query: must route to react.dev
  const reactRes = resolveOfficialDomainsForQuery('what are react hooks and useMemo');
  assert.equal(reactRes.detectedTech, 'react');
  assert.equal(reactRes.primaryOfficialDomain, 'react.dev');
  assert.ok(reactRes.targetDomains.includes('react.dev'));
  assert.ok(reactRes.targetDomains.includes('geeksforgeeks.org'));
  assert.ok(reactRes.targetDomains.includes('en.wikipedia.org'));

  // 4. PostgreSQL query: must route to postgresql.org
  const pgRes = resolveOfficialDomainsForQuery('explain postgresql b-tree indexes');
  assert.equal(pgRes.detectedTech, 'postgresql');
  assert.equal(pgRes.primaryOfficialDomain, 'postgresql.org');
  assert.ok(pgRes.targetDomains.includes('postgresql.org'));
  assert.ok(pgRes.targetDomains.includes('geeksforgeeks.org'));

  // 5. Docker query: must route to docs.docker.com
  const dockerRes = resolveOfficialDomainsForQuery('what is docker container isolation');
  assert.equal(dockerRes.detectedTech, 'docker');
  assert.equal(dockerRes.primaryOfficialDomain, 'docs.docker.com');
  assert.ok(dockerRes.targetDomains.includes('docs.docker.com'));

  // 6. Role-based fallback queries (no specific technology mentioned)
  const aimlRoleRes = resolveOfficialDomainsForQuery('explain bias variance tradeoff', 'aiml');
  assert.ok(aimlRoleRes.targetDomains.includes('geeksforgeeks.org'));
  assert.ok(aimlRoleRes.targetDomains.includes('en.wikipedia.org'));
  assert.ok(aimlRoleRes.targetDomains.includes('w3schools.com'));
  assert.ok(aimlRoleRes.targetDomains.includes('scikit-learn.org'));
  assert.ok(aimlRoleRes.targetDomains.includes('pytorch.org'));

  const sdeRoleRes = resolveOfficialDomainsForQuery('what is abstraction in oop', 'sde');
  assert.ok(sdeRoleRes.targetDomains.includes('geeksforgeeks.org'));
  assert.ok(sdeRoleRes.targetDomains.includes('en.wikipedia.org'));
  assert.ok(sdeRoleRes.targetDomains.includes('w3schools.com'));
  assert.ok(sdeRoleRes.targetDomains.includes('developer.mozilla.org'));
});

test('Default Interview Roles (SDE, AI/ML, Tech, General) are seeded and UI provides non-clipped role selector', () => {
  // 1. Verify ModesManager seeds default roles and handbooks
  const modesMgrPath = path.join(projectRoot, 'electron', 'services', 'ModesManager.ts');
  const modesMgrContent = fs.readFileSync(modesMgrPath, 'utf-8');
  assert.ok(modesMgrContent.includes("templateType === 'sde-interview'"), 'ensureSeeded should check for sde-interview');
  assert.ok(modesMgrContent.includes("templateType === 'aiml-interview'"), 'ensureSeeded should check for aiml-interview');
  assert.ok(modesMgrContent.includes("templateType === 'technical-interview'"), 'ensureSeeded should check for technical-interview');
  assert.ok(modesMgrContent.includes("this.ensureOfficialKnowledgeBooks()"), 'ensureSeeded should trigger ensureOfficialKnowledgeBooks');

  // 2. Verify builtinModes.ts contains labels
  const builtinPath = path.join(projectRoot, 'electron', 'services', 'builtinModes.ts');
  const builtinContent = fs.readFileSync(builtinPath, 'utf-8');
  assert.ok(builtinContent.includes("'sde-interview': 'SDE Interview'"), 'builtinModes should have SDE Interview label');
  assert.ok(builtinContent.includes("'aiml-interview': 'AI/ML Interview'"), 'builtinModes should have AI/ML Interview label');

  // 3. Verify ipcHandlers.ts allows setting active interview roles without pro restriction and sets modeIdToSet
  const ipcPath = path.join(projectRoot, 'electron', 'ipcHandlers.ts');
  const ipcContent = fs.readFileSync(ipcPath, 'utf-8');
  assert.ok(ipcContent.includes("targetMode.templateType === 'sde-interview'"), 'modes:set-active should allow sde-interview');
  assert.ok(ipcContent.includes("targetMode.templateType === 'aiml-interview'"), 'modes:set-active should allow aiml-interview');
  assert.ok(ipcContent.includes("targetMode.templateType === 'technical-interview'"), 'modes:set-active should allow technical-interview');
  assert.ok(ipcContent.includes("ModesManager.getInstance().setActiveMode(modeIdToSet)"), 'modes:set-active must activate modeIdToSet');

  // 4. Verify ModesManager resolves templateType to mode.id automatically
  const mmPath = path.join(projectRoot, 'electron', 'services', 'ModesManager.ts');
  const mmContent = fs.readFileSync(mmPath, 'utf-8');
  assert.ok(mmContent.includes("m.id === id || m.templateType === id"), 'ModesManager.setActiveMode must resolve templateType to mode.id');

  // 5. Verify NativelyInterface provides SDE, AIML, Tech roles, in-flow drawer architecture, and prevents clipping
  const uiPath = path.join(projectRoot, 'src', 'components', 'NativelyInterface.tsx');
  const uiContent = fs.readFileSync(uiPath, 'utf-8');
  assert.ok(uiContent.includes("handleSelectRole('sde-interview')"), 'UI should have SDE role button');
  assert.ok(uiContent.includes("handleSelectRole('aiml-interview')"), 'UI should have AIML role button');
  assert.ok(uiContent.includes("handleSelectRole('technical-interview')"), 'UI should have Technical Interview role button');
  assert.ok(uiContent.includes("resolveRoleSlug"), 'UI should have robust resolveRoleSlug helper');
  assert.ok(uiContent.includes("data-role-selector-root"), 'UI should render in-flow role selector drawer to prevent clipping');
  assert.ok(uiContent.includes("data-file-menu-root"), 'UI should render in-flow file menu drawer to prevent clipping');
  assert.ok(uiContent.includes("minHeight: (showRoleSelector || showFileMenu) ? 380 : undefined"), 'UI shellRef must expand minHeight when role selector or file menu is open');
});
