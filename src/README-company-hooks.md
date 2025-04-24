# Hooks pentru Gestionarea Companiilor

Acest document descrie hook-urile create pentru gestionarea companiilor în aplicație.

## Hook-uri Disponibile

### 1. useCompanies

Hook pentru gestionarea listei de companii.

```typescript
const {
  companies,              // Lista completă de companii
  filteredCompanies,      // Lista de companii filtrate
  paginatedCompanies,     // Lista de companii pentru pagina curentă
  loading,                // Indicator de încărcare
  error,                  // Eroare (dacă există)
  filters,                // Filtrele aplicate
  setFilters,             // Funcție pentru actualizarea filtrelor
  sort,                   // Sortarea aplicată
  setSort,                // Funcție pentru actualizarea sortării
  pagination,             // Informații despre paginare
  setPagination,          // Funcție pentru actualizarea paginării
  statuses,               // Lista de statusuri disponibile
  subscriptionPlans,      // Lista de planuri de abonament disponibile
  loadCompanies,          // Funcție pentru reîncărcarea companiilor
  createCompany,          // Funcție pentru crearea unei companii
  updateCompany,          // Funcție pentru actualizarea unei companii
  deleteCompany,          // Funcție pentru ștergerea unei companii
  updateCompanyStatus     // Funcție pentru actualizarea statusului unei companii
} = useCompanies();
```

### 2. useCompany

Hook pentru gestionarea unei singure companii.

```typescript
const {
  company,                // Detaliile companiei
  users,                  // Lista completă de utilizatori ai companiei
  filteredUsers,          // Lista de utilizatori filtrați
  paginatedUsers,         // Lista de utilizatori pentru pagina curentă
  loading,                // Indicator de încărcare
  error,                  // Eroare (dacă există)
  userFilters,            // Filtrele aplicate pentru utilizatori
  setUserFilters,         // Funcție pentru actualizarea filtrelor pentru utilizatori
  userSort,               // Sortarea aplicată pentru utilizatori
  setUserSort,            // Funcție pentru actualizarea sortării pentru utilizatori
  userPagination,         // Informații despre paginarea utilizatorilor
  setUserPagination,      // Funcție pentru actualizarea paginării utilizatorilor
  roles,                  // Lista de roluri disponibile
  loadCompany,            // Funcție pentru reîncărcarea detaliilor companiei
  loadCompanyUsers,       // Funcție pentru reîncărcarea utilizatorilor companiei
  updateCompany,          // Funcție pentru actualizarea companiei
  addUserToCompany,       // Funcție pentru adăugarea unui utilizator la companie
  updateUserRole,         // Funcție pentru actualizarea rolului unui utilizator
  removeUserFromCompany,  // Funcție pentru eliminarea unui utilizator din companie
  sendInvitation          // Funcție pentru trimiterea unei invitații
} = useCompany(companyId);
```

### 3. useUserCompanies

Hook pentru gestionarea companiilor utilizatorului curent.

```typescript
const {
  companies,              // Lista de companii ale utilizatorului
  selectedCompany,        // Compania selectată
  userRoles,              // Rolurile utilizatorului în fiecare companie
  loading,                // Indicator de încărcare
  error,                  // Eroare (dacă există)
  loadUserCompanies,      // Funcție pentru reîncărcarea companiilor utilizatorului
  selectCompany,          // Funcție pentru selectarea unei companii
  isCompanyAdmin,         // Funcție pentru verificarea dacă utilizatorul este admin într-o companie
  hasRole                 // Funcție pentru verificarea dacă utilizatorul are un anumit rol într-o companie
} = useUserCompanies();
```

## Componente Create

### 1. CompanyList

Componentă pentru afișarea listei de companii.

```typescript
<CompanyList
  onAddCompany={handleAddCompany}
  onEditCompany={handleEditCompany}
  onDeleteCompany={handleDeleteCompany}
  onManageUsers={handleManageUsers}
  onManageSettings={handleManageSettings}
/>
```

### 2. CompanyDetails

Componentă pentru afișarea detaliilor unei companii.

```typescript
<CompanyDetails
  companyId={id}
  onBack={handleBack}
/>
```

### 3. CompanyUsersList

Componentă pentru afișarea utilizatorilor unei companii.

```typescript
<CompanyUsersList
  companyId={companyId}
/>
```

## Pagini Create

### 1. CompanyManagementPage

Pagină pentru gestionarea companiilor.

```typescript
<Route path="companies" element={<CompanyManagementPage />} />
```

### 2. CompanyDetailsPage

Pagină pentru afișarea detaliilor unei companii.

```typescript
<Route path="companies/:id" element={<CompanyDetailsPage />} />
<Route path="companies/edit/:id" element={<CompanyDetailsPage />} />
```

## Utilizare

Pentru a utiliza aceste hook-uri și componente, importați-le din locațiile corespunzătoare:

```typescript
import { useCompanies, useCompany, useUserCompanies } from '@/hooks';
import { CompanyList, CompanyDetails, CompanyUsersList } from '@/components/companies';
```

Apoi, utilizați-le în componentele dvs. conform exemplelor de mai sus.
