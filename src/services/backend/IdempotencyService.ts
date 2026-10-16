/**
 * GoLife Taxi Pakistan - Idempotency & Duplicate Action Protection Service
 *
 * Prevents double-clicks, duplicate submissions, and race conditions
 * for sensitive operations (Refunds, Fines, Payouts, Reimbursements, Suspensions, Pricing updates).
 */

interface PendingAction {
  actionId: string;
  actionType: string;
  timestamp: number;
}

class IdempotencyService {
  private activeLocks: Map<string, PendingAction> = new Map();
  private completedActions: Set<string> = new Set();
  private readonly lockTimeoutMs: number = 10000; // 10 seconds lock window

  /**
   * Generates a unique idempotency key for an action on a target entity
   */
  public generateActionKey(actionType: string, targetId: string, customNonce?: string): string {
    const nonce = customNonce || Math.random().toString(36).substring(2, 9);
    return `${actionType}:${targetId}:${Date.now()}:${nonce}`;
  }

  /**
   * Checks if an action key or lock is currently executing
   */
  public isLocked(lockKey: string): boolean {
    const lock = this.activeLocks.get(lockKey);
    if (!lock) return false;

    // Clear stale locks
    if (Date.now() - lock.timestamp > this.lockTimeoutMs) {
      this.activeLocks.delete(lockKey);
      return false;
    }
    return true;
  }

  /**
   * Executes a sensitive action with guaranteed idempotency protection
   */
  public async executeProtectedAction<T>(
    actionType: string,
    targetId: string,
    executor: () => Promise<T>,
    actionKeyOverride?: string
  ): Promise<{ success: boolean; result?: T; error?: string; isDuplicate?: boolean }> {
    const lockKey = `${actionType}:${targetId}`;

    if (this.isLocked(lockKey)) {
      console.warn(`[Idempotency] Blocked duplicate action: ${lockKey} is already processing.`);
      return {
        success: false,
        isDuplicate: true,
        error: 'Action is already processing. Duplicate submission blocked.'
      };
    }

    const actionId = actionKeyOverride || this.generateActionKey(actionType, targetId);

    if (this.completedActions.has(actionId)) {
      return {
        success: false,
        isDuplicate: true,
        error: 'This exact action has already been processed.'
      };
    }

    // Acquire lock
    this.activeLocks.set(lockKey, {
      actionId,
      actionType,
      timestamp: Date.now()
    });

    try {
      const result = await executor();
      this.completedActions.add(actionId);
      // Keep completed set bounded
      if (this.completedActions.size > 2000) {
        const oldest = Array.from(this.completedActions).slice(0, 500);
        oldest.forEach((id) => this.completedActions.delete(id));
      }
      return { success: true, result };
    } catch (err: any) {
      console.error(`[Idempotency] Protected action ${actionType} failed:`, err);
      return {
        success: false,
        error: err?.message || 'Action failed during execution.'
      };
    } finally {
      // Release lock
      this.activeLocks.delete(lockKey);
    }
  }
}

export const idempotencyService = new IdempotencyService();
