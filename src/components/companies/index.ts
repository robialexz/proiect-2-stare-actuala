/**
 * Exportă toate componentele legate de companii
 */

// Exportăm componentele
export { default as CompanyList } from './CompanyList';
export { default as CompanyDetails } from './CompanyDetails';
export { default as CompanyUsersList } from './CompanyUsersList';

// Export implicit pentru compatibilitate
import CompanyList from './CompanyList';
import CompanyDetails from './CompanyDetails';
import CompanyUsersList from './CompanyUsersList';

const companyComponents = {
  CompanyList,
  CompanyDetails,
  CompanyUsersList,
};

export default companyComponents;
