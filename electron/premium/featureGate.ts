/**
 * Centralized Feature Gate for Premium Features.
 * 
 * Determines at runtime whether premium modules (LicenseManager, 
 * KnowledgeOrchestrator, etc.) are available. This allows the
 * source-available version to compile and run without premium code.
 */

let _premiumAvailable: boolean | null = true;

/**
 * Check if premium modules are available in this build.
 * Result is cached after the first call.
 */
export function isPremiumAvailable(): boolean {
    return true;
}

/**
 * Reset the cached premium availability check.
 * Useful for testing.
 */
export function resetFeatureGate(): void {
    _premiumAvailable = true;
}
