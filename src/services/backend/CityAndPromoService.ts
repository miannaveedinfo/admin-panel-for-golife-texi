/**
 * GoLife Taxi Pakistan - CityService & PromotionService
 */

import { BaseService } from './BaseService';
import { CityConfig, ServiceCategoryConfig, PromoCode } from '../../types';
import { ServiceResponse } from './types';

export class CityService extends BaseService {
  public async getCities(): Promise<CityConfig[]> {
    const res = await this.repository.list<CityConfig>('cities', undefined, { limit: 50 });
    return res.items;
  }

  public async updateCity(cityId: string, updates: Partial<CityConfig>): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('cities', cityId, updates);
    return this.formatResponse(ok);
  }

  public async toggleCityStatus(cityId: string, active: boolean, status: string): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('cities', cityId, { active, status });
    return this.formatResponse(ok);
  }

  public async getServiceCategories(): Promise<ServiceCategoryConfig[]> {
    const res = await this.repository.list<ServiceCategoryConfig>('serviceCategories', undefined, { limit: 30 });
    return res.items;
  }

  public async toggleCategoryStatus(categoryId: string, active: boolean): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('serviceCategories', categoryId, { active });
    return this.formatResponse(ok);
  }

  /**
   * Check if a city & category combination is currently available for passenger booking
   * Enforces central operating hours, intercity, and freight settings.
   */
  public async isServiceAvailable(
    cityName: string,
    categoryName: string,
    isIntercity: boolean = false,
    isFreight: boolean = false
  ): Promise<{ available: boolean; reason?: string }> {
    const cities = await this.getCities();
    const targetCity = cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase());

    if (!targetCity) {
      return { available: false, reason: `Service not launched in ${cityName}` };
    }
    if (!targetCity.active || targetCity.status === 'temporarily_suspended' || targetCity.status === 'inactive') {
      return { available: false, reason: `GoLife operations in ${cityName} are currently paused by Admin` };
    }

    if (isIntercity && !targetCity.intercityEnabled) {
      return { available: false, reason: `Intercity trips from ${cityName} are currently disabled` };
    }

    const supportsFreight = targetCity.supportedCategories?.includes('GoFreight') || (targetCity as any).freightEnabled;
    if (isFreight && !supportsFreight) {
      return { available: false, reason: `Freight cargo dispatch in ${cityName} is currently disabled` };
    }

    return { available: true };
  }
}

export class PromotionService extends BaseService {
  public async getPromos(): Promise<PromoCode[]> {
    const res = await this.repository.list<PromoCode>('promoCodes', undefined, { limit: 100 });
    return res.items;
  }

  public async savePromo(promo: PromoCode): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.create('promoCodes', promo.id, promo);
    return this.formatResponse(ok);
  }

  public async togglePromo(promoId: string, active: boolean): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('promoCodes', promoId, { active });
    return this.formatResponse(ok);
  }
}

export const cityService = new CityService();
export const promotionService = new PromotionService();
