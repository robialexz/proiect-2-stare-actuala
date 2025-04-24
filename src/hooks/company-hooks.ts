/**
 * Exportă toate hook-urile legate de companii
 */

// Exportăm hook-urile
export { useCompanies } from './useCompanies';
export { useCompany } from './useCompany';
export { useUserCompanies } from './useUserCompanies';
export { useCompanyInventory } from './useCompanyInventory';

// Export implicit pentru compatibilitate
import { useCompanies } from './useCompanies';
import { useCompany } from './useCompany';
import { useUserCompanies } from './useUserCompanies';
import { useCompanyInventory } from './useCompanyInventory';

const companyHooks = {
  useCompanies,
  useCompany,
  useUserCompanies,
  useCompanyInventory,
};

export default companyHooks;
