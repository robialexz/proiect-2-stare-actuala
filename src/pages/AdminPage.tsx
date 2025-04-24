import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserWithRole } from "@/models/user";
import {
  Users,
  Shield,
  Activity,
  RefreshCw,
  Settings,
  Server,
  FileText,
  BarChart,
} from "lucide-react";
import { Link } from "react-router-dom";
import UsersList from "@/components/admin/UsersList";
import UserRoleDialog from "@/components/admin/UserRoleDialog";
import UserDetailsDialog from "@/components/admin/UserDetailsDialog";
import UserActivityDialog from "@/components/admin/UserActivityDialog";
import AnimatedButton from "@/components/ui/animated-button";

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const [activeTab, setActiveTab] = useState("users");

  // State pentru dialoguri
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);

  // Folosim hook-ul pentru gestionarea utilizatorilor
  const {
    users,
    roles,
    permissions,
    activities,
    selectedUser,
    loading,
    loadUsers,
    loadRoles,
    loadPermissions,
    loadActivities,
    updateUserRole,
    setSelectedUser,
  } = useUserManagement();

  // Încărcăm datele inițiale
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadRoles();
      loadPermissions();
      loadActivities();
    }
  }, [isAdmin, loadUsers, loadRoles, loadPermissions, loadActivities]);

  // Gestionăm vizualizarea detaliilor unui utilizator
  const handleViewUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  };

  // Gestionăm editarea rolului unui utilizator
  const handleEditRole = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };

  // Gestionăm vizualizarea activității unui utilizator
  const handleViewActivity = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsActivityDialogOpen(true);
  };

  // Afișăm un indicator de încărcare în timpul verificării autentificării
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">
            {t("admin.loading", "Loading...")}
          </p>
        </div>
      </div>
    );
  }

  // Verificăm dacă utilizatorul este autentificat
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Verificăm dacă utilizatorul are rolul de admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <Helmet>
        <title>{t("admin.pageTitle", "Admin Panel")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t("admin.title", "Admin Panel")}
              </h1>
              <p className="text-muted-foreground">
                {t("admin.subtitle", "Manage users, roles, and permissions")}
              </p>
            </div>

            <AnimatedButton
              animationType="glow"
              onClick={loadUsers}
              disabled={loading.users}
            >
              {loading.users ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t("admin.refresh", "Refresh")}
            </AnimatedButton>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              {t("admin.tabs.users", "Users")}
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="h-4 w-4 mr-2" />
              {t("admin.tabs.roles", "Roles")}
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              {t("admin.tabs.activity", "Activity")}
            </TabsTrigger>
            <TabsTrigger value="system">
              <Server className="h-4 w-4 mr-2" />
              {t("admin.tabs.system", "System")}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              {t("admin.tabs.settings", "Settings")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{t("admin.users.title", "Users")}</CardTitle>
                <CardDescription>
                  {t("admin.users.description", "Manage users and their roles")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersList
                  users={users}
                  onViewUser={handleViewUser}
                  onEditRole={handleEditRole}
                  onViewActivity={handleViewActivity}
                  loading={loading.users}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  {t("admin.roles.title", "Roles & Permissions")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "admin.roles.description",
                    "Manage roles and their permissions"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/role-management" className="block">
                    <Card className="h-full hover:bg-slate-800/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="h-5 w-5 mr-2" />
                          {t("admin.roles.roleManagement", "Role Management")}
                        </CardTitle>
                        <CardDescription>
                          {t(
                            "admin.roles.roleManagementDesc",
                            "Assign and manage user roles"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "admin.roles.roleManagementInfo",
                            "Assign roles to users and manage role permissions"
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Card className="h-full bg-slate-800/30">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        {t("admin.roles.permissionMatrix", "Permission Matrix")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "admin.roles.permissionMatrixDesc",
                          "Configure role permissions"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "admin.roles.comingSoon",
                          "Role and permission management coming soon."
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  {t("admin.activity.title", "Activity Log")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "admin.activity.description",
                    "View system activity and audit logs"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/user-activity" className="block">
                    <Card className="h-full hover:bg-slate-800/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Activity className="h-5 w-5 mr-2" />
                          {t("admin.activity.userActivity", "User Activity")}
                        </CardTitle>
                        <CardDescription>
                          {t(
                            "admin.activity.userActivityDesc",
                            "Monitor user actions"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "admin.activity.userActivityInfo",
                            "Track and monitor user actions in the system"
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Card className="h-full bg-slate-800/30">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart className="h-5 w-5 mr-2" />
                        {t("admin.activity.analytics", "Analytics")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "admin.activity.analyticsDesc",
                          "System usage analytics"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "admin.activity.comingSoon",
                          "Activity analytics coming soon."
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  {t("admin.system.title", "System Status")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "admin.system.description",
                    "Monitor system health and performance"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/site-status" className="block">
                    <Card className="h-full hover:bg-slate-800/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Server className="h-5 w-5 mr-2" />
                          {t("admin.system.siteStatus", "Site Status")}
                        </CardTitle>
                        <CardDescription>
                          {t(
                            "admin.system.siteStatusDesc",
                            "Monitor site health"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "admin.system.siteStatusInfo",
                            "View system health, performance metrics, and component status"
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Card className="h-full bg-slate-800/30">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        {t("admin.system.performance", "Performance")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "admin.system.performanceDesc",
                          "System performance metrics"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "admin.system.comingSoon",
                          "Performance monitoring coming soon."
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  {t("admin.settings.title", "System Settings")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "admin.settings.description",
                    "Configure system settings and preferences"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/system-settings" className="block">
                    <Card className="h-full hover:bg-slate-800/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Settings className="h-5 w-5 mr-2" />
                          {t(
                            "admin.settings.systemSettings",
                            "System Settings"
                          )}
                        </CardTitle>
                        <CardDescription>
                          {t(
                            "admin.settings.systemSettingsDesc",
                            "Configure system settings"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "admin.settings.systemSettingsInfo",
                            "Configure global system settings and preferences"
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Card className="h-full bg-slate-800/30">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        {t("admin.settings.security", "Security Settings")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "admin.settings.securityDesc",
                          "Configure security settings"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "admin.settings.comingSoon",
                          "Security settings coming soon."
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialoguri */}
      <UserRoleDialog
        user={selectedUser}
        roles={roles}
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        onUpdateRole={updateUserRole}
        loading={loading.updateRole}
      />

      <UserDetailsDialog
        user={selectedUser}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />

      <UserActivityDialog
        user={selectedUser}
        open={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
      />
    </>
  );
};

export default AdminPage;
