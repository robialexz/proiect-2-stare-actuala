/**
 * Exportă toate paginile legate de companii
 */

// Exportăm paginile
export { default as CompanyManagementPage } from './CompanyManagementPage';
export { default as CompanyDetailsPage } from './CompanyDetailsPage';
export { default as AddCompanyPage } from './AddCompanyPage';
export { default as CompanyUsersPage } from './CompanyUsersPage';

// Export implicit pentru compatibilitate
import CompanyManagementPage from './CompanyManagementPage';
import CompanyDetailsPage from './CompanyDetailsPage';
import AddCompanyPage from './AddCompanyPage';
import CompanyUsersPage from './CompanyUsersPage';

const companyPages = {
  CompanyManagementPage,
  CompanyDetailsPage,
  AddCompanyPage,
  CompanyUsersPage,
};

export default companyPages;
