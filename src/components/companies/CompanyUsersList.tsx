import React, { useState } from 'react';
import { useCompany } from '@/hooks';
import { CompanyUserRole } from '@/models/company';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash, 
  Mail, 
  Shield, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

interface CompanyUsersListProps {
  companyId: string;
}

export const CompanyUsersList: React.FC<CompanyUsersListProps> = ({
  companyId
}) => {
  const {
    users,
    filteredUsers,
    paginatedUsers,
    loading,
    error,
    userFilters,
    setUserFilters,
    userPagination,
    setUserPagination,
    roles,
    loadCompanyUsers,
    addUserToCompany,
    updateUserRole,
    removeUserFromCompany,
    sendInvitation
  } = useCompany(companyId);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<CompanyUserRole | ''>('');
  const [isAdminFilter, setIsAdminFilter] = useState<boolean | undefined>(undefined);

  // State pentru dialog de invitație
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CompanyUserRole>(CompanyUserRole.VIEWER);
  const [inviteIsAdmin, setInviteIsAdmin] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  // State pentru dialog de editare rol
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState('');
  const [editRole, setEditRole] = useState<CompanyUserRole>(CompanyUserRole.VIEWER);
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Funcție pentru a actualiza filtrele
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setUserFilters({ ...userFilters, search: value });
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value as CompanyUserRole | '');
    setUserFilters({ ...userFilters, role: value ? (value as CompanyUserRole) : undefined });
  };

  const handleIsAdminChange = (value: boolean | undefined) => {
    setIsAdminFilter(value);
    setUserFilters({ ...userFilters, is_admin: value });
  };

  // Funcție pentru a gestiona paginarea
  const handlePageChange = (page: number) => {
    setUserPagination({ ...userPagination, page });
  };

  // Funcții pentru invitație
  const handleInviteUser = async () => {
    if (!inviteEmail) return;

    setInviteLoading(true);
    try {
      const result = await sendInvitation(inviteEmail, inviteRole, inviteIsAdmin);
      if (result.success) {
        setInviteDialogOpen(false);
        setInviteEmail('');
        setInviteRole(CompanyUserRole.VIEWER);
        setInviteIsAdmin(false);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  // Funcții pentru editare rol
  const handleEditUser = (userId: string, role: CompanyUserRole, isAdmin: boolean) => {
    setEditUserId(userId);
    setEditRole(role);
    setEditIsAdmin(isAdmin);
    setEditDialogOpen(true);
  };

  const handleUpdateUserRole = async () => {
    if (!editUserId) return;

    setEditLoading(true);
    try {
      const result = await updateUserRole(editUserId, editRole, editIsAdmin);
      if (result.success) {
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setEditLoading(false);
    }
  };

  // Funcție pentru ștergere utilizator
  const handleRemoveUser = async (userId: string) => {
    if (window.confirm('Sunteți sigur că doriți să eliminați acest utilizator din companie?')) {
      await removeUserFromCompany(userId);
    }
  };

  // Funcție pentru a obține inițialele din numele utilizatorului
  const getInitials = (name?: string, email?: string): string => {
    if (name) {
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">
          <p>A apărut o eroare la încărcarea utilizatorilor.</p>
          <p>{error}</p>
          <Button onClick={() => loadCompanyUsers()} className="mt-4">
            Reîncarcă
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Utilizatori Companie</CardTitle>
            <CardDescription>Gestionează utilizatorii companiei</CardDescription>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invită Utilizator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invită Utilizator</DialogTitle>
                <DialogDescription>
                  Trimite o invitație unui utilizator pentru a se alătura companiei.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="email@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as CompanyUserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CompanyUserRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-admin"
                    checked={inviteIsAdmin}
                    onCheckedChange={setInviteIsAdmin}
                  />
                  <Label htmlFor="is-admin">Administrator Companie</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Anulează
                </Button>
                <Button onClick={handleInviteUser} disabled={!inviteEmail || inviteLoading}>
                  {inviteLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Trimite Invitație
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Caută utilizatori..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={roleFilter} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrează după rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toate rolurile</SelectItem>
                  {Object.values(CompanyUserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-64">
              <Select 
                value={isAdminFilter === undefined ? '' : isAdminFilter ? 'true' : 'false'} 
                onValueChange={(value) => handleIsAdminChange(value === '' ? undefined : value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrează după admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toți utilizatorii</SelectItem>
                  <SelectItem value="true">Doar administratori</SelectItem>
                  <SelectItem value="false">Fără administratori</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {paginatedUsers.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Nu există utilizatori</h3>
              <p className="mt-2 text-gray-500">
                Nu am găsit niciun utilizator care să corespundă criteriilor de căutare.
              </p>
              <Button onClick={() => setInviteDialogOpen(true)} className="mt-4">
                <UserPlus className="h-4 w-4 mr-2" />
                Invită primul utilizator
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilizator</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead className="text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.user?.avatar_url} />
                            <AvatarFallback>
                              {getInitials(user.user?.display_name, user.user?.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.user?.display_name || 'Utilizator'}</div>
                            <div className="text-sm text-gray-500">{user.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_admin ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Da</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span>Nu</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user.user_id, user.role, user.is_admin)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editează</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveUser(user.user_id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Șterge</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Paginare */}
          {filteredUsers.length > userPagination.pageSize && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={userPagination.page === 1}
                  onClick={() => handlePageChange(userPagination.page - 1)}
                >
                  Anterior
                </Button>
                
                {Array.from({ length: Math.ceil(userPagination.total / userPagination.pageSize) }).map((_, index) => (
                  <Button
                    key={index}
                    variant={userPagination.page === index + 1 ? "default" : "outline"}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  disabled={userPagination.page >= Math.ceil(userPagination.total / userPagination.pageSize)}
                  onClick={() => handlePageChange(userPagination.page + 1)}
                >
                  Următor
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pentru editare rol */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editează Rol Utilizator</DialogTitle>
            <DialogDescription>
              Modifică rolul și permisiunile utilizatorului în companie.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as CompanyUserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează rol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CompanyUserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-admin"
                checked={editIsAdmin}
                onCheckedChange={setEditIsAdmin}
              />
              <Label htmlFor="edit-is-admin">Administrator Companie</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleUpdateUserRole} disabled={editLoading}>
              {editLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyUsersList;
