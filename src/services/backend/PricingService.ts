/**
 * GoLife Taxi Pakistan - PricingService
 * Manages central tariff rules, versioned historical rules, surge settings, and driver commission rates.
 * Historical rides retain pricingRuleVersionId so past fares are never changed.
 */

import { BaseService } from './BaseService';
import { CentralPricingRule, RideCategory } from '../../types';
import { ServiceResponse } from './types';
import { calculateDeterministicFare, CalculatedFareBreakdown, PricingCalculationInput } from './CentralAdminControl';

export class PricingService extends BaseService {
  /**
   * Fetch all active central pricing rules
   */
  public async getPricingRules(): Promise<CentralPricingRule[]> {
    const res = await this.repository.list<CentralPricingRule>('pricingRules', undefined, { limit: 100 });
    return res.items;
  }

  /**
   * Shared pricing calculator - Used by Passenger App, Driver App, and Admin
   * Guarantees identical fare calculation across all surfaces.
   */
  public async calculateTripFare(
    input: PricingCalculationInput
  ): Promise<CalculatedFareBreakdown> {
    const rules = await this.getPricingRules();
    const activeRule = rules.length > 0 ? rules[0] : undefined;
    return calculateDeterministicFare(input, activeRule);
  }

  /**
   * Save or update pricing rule with automatic immutable version snapshot
   */
  public async savePricingRule(
    rule: CentralPricingRule,
    adminId: string,
    changeReason: string
  ): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('PRICING_RULE_UPDATE', rule.id, async () => {
      const now = new Date().toISOString();
      const currentVerNum = parseInt((rule.versionId || 'v1').replace(/\D/g, '') || '1', 10);
      const versionNumber = currentVerNum + 1;
      const nextVersionId = `v${versionNumber}`;

      // 1. Snapshot current/new rule into pricingRuleVersions (immutable)
      const versionDoc = {
        ...rule,
        id: `pv-${rule.id}-v${versionNumber}`,
        ruleId: rule.id,
        versionId: nextVersionId,
        effectiveFrom: now,
        createdBy: adminId,
        changeReason,
        immutable: true
      };
      await this.repository.create('pricingRuleVersions', versionDoc.id, versionDoc);

      // 2. Update live rule
      const updatedLiveRule: CentralPricingRule = {
        ...rule,
        versionId: nextVersionId,
        updatedAt: now
      };
      const ok = await this.repository.create('pricingRules', rule.id, updatedLiveRule);

      return ok;
    });
  }
}

export const pricingService = new PricingService();
