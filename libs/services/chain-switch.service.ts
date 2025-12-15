import type { EnhancedCategorizedError } from "@/libs/utils/contract-error-handler";

class ChainSwitchService {
  private chainErrorHandler:
    | ((error: EnhancedCategorizedError) => Promise<void>)
    | null = null;

  register(handler: (error: EnhancedCategorizedError) => Promise<void>) {
    this.chainErrorHandler = handler;
  }

  unregister() {
    this.chainErrorHandler = null;
  }

  async handleChainError(error: EnhancedCategorizedError): Promise<void> {
    if (this.chainErrorHandler) {
      try {
        await this.chainErrorHandler(error);
      } catch (err) {
        console.error("Chain switch service handler failed:", err);
      }
    } else {
      console.warn(
        "Chain error detected but no handler registered. Make sure useChainSwitch is initialized."
      );
    }
  }

  isRegistered(): boolean {
    return this.chainErrorHandler !== null;
  }
}

// Export singleton instance
export const chainSwitchService = new ChainSwitchService();
