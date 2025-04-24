import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  Shield,
  Bell,
  Moon,
  Sun,
  Languages,
  Lock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Camera,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

type ProfileData = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  skills: string[] | null;
  theme_preference: string | null;
  language_preference: string | null;
  email_notifications: boolean;
  mobile_notifications: boolean;
  created_at: string | null;
};

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Form states
  const [formData, setFormData] = useState({
    full_name: "",
    job_title: "",
    phone: "",
    location: "",
    bio: "",
    skills: [] as string[],
    avatar_url: "",
    theme_preference: "system",
    language_preference: "ro",
    email_notifications: true,
    mobile_notifications: true,
  });

  // New skill input
  const [newSkill, setNewSkill] = useState("");

  // Password change states
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user && !loading) {
      fetchProfileData();
    } else if (!loading && !user) {
      setIsLoading(false);
    }
  }, [user, loading]);

  const fetchProfileData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // First check if profile exists
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfileData(data as ProfileData);
        setFormData({
          full_name: data.full_name || "",
          job_title: data.job_title || "",
          phone: data.phone || "",
          location: data.location || "",
          bio: data.bio || "",
          skills: data.skills || [],
          avatar_url: data.avatar_url || "",
          theme_preference: data.theme_preference || "system",
          language_preference: data.language_preference || "ro",
          email_notifications: data.email_notifications || true,
          mobile_notifications: data.mobile_notifications || true,
        });
      } else {
        // Create a new profile if it doesn't exist
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || "",
          avatar_url: user.user_metadata?.avatar_url || "{process.env.URL_1}",
          email: user.email,
          job_title: "",
          phone: "",
          location: "",
          bio: "",
          skills: [],
          theme_preference: "system",
          language_preference: "ro",
          email_notifications: true,
          mobile_notifications: true,
          created_at: new Date().toISOString(),
        };

        const { data: newData, error: insertError } = await supabase
          .from("profiles")
          .insert([newProfile])
          .select()
          .single();

        if (insertError) throw insertError;

        setProfileData(newData as ProfileData);
        setFormData({
          full_name: newData.full_name || "",
          job_title: newData.job_title || "",
          phone: newData.phone || "",
          location: newData.location || "",
          bio: newData.bio || "",
          skills: newData.skills || [],
          avatar_url: newData.avatar_url || "",
          theme_preference: newData.theme_preference || "system",
          language_preference: newData.language_preference || "ro",
          email_notifications: newData.email_notifications || true,
          mobile_notifications: newData.mobile_notifications || true,
        });
      }
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("profile.errors.fetchFailed", "Failed to load profile"),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleAvatarChange = () => {
    // In a real app, this would open a file picker
    // For now, we'll just generate a random avatar
    const randomSeed = Math.random().toString(36).substring(2, 8);
    const newAvatarUrl = `https://avatars.dicebear.com/api/initials/${randomSeed}.svg`;

    setFormData((prev) => ({
      ...prev,
      avatar_url: newAvatarUrl,
    }));

    toast({
      title: t("profile.success.avatarChanged", "Avatar changed"),
      description: t(
        "profile.success.avatarChangedDesc",
        "Your avatar has been updated successfully."
      ),
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          job_title: formData.job_title,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          skills: formData.skills,
          avatar_url: formData.avatar_url,
          theme_preference: formData.theme_preference,
          language_preference: formData.language_preference,
          email_notifications: formData.email_notifications,
          mobile_notifications: formData.mobile_notifications,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: t("profile.success.saved", "Profile saved"),
        description: t(
          "profile.success.savedDesc",
          "Your profile has been updated successfully."
        ),
      });

      // Refresh profile data
      fetchProfileData();
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("profile.errors.saveFailed", "Failed to save profile"),
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        variant: "destructive",
        title: t("profile.errors.passwordMismatch", "Passwords don't match"),
        description: t(
          "profile.errors.passwordMismatchDesc",
          "New password and confirmation must match."
        ),
      });
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast({
        variant: "destructive",
        title: t("profile.errors.passwordTooShort", "Password too short"),
        description: t(
          "profile.errors.passwordTooShortDesc",
          "Password must be at least 6 characters."
        ),
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password,
      });

      if (error) throw error;

      toast({
        title: t("profile.success.passwordChanged", "Password changed"),
        description: t(
          "profile.success.passwordChangedDesc",
          "Your password has been updated successfully."
        ),
      });

      // Clear password fields
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t(
          "profile.errors.passwordChangeFailed",
          "Failed to change password"
        ),
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">{t("common.loading", "Loading...")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full"></div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                {t("profile.pageTitle", "Profil utilizator")}
              </h1>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 relative group overflow-hidden"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                {isSaving
                  ? t("common.saving", "Se salvează...")
                  : t("common.save", "Salvează modificările")}
              </Button>
            </motion.div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-900 to-slate-900/95">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Summary Card */}
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 md:w-1/3 relative overflow-hidden group">
                {/* Background gradient effects */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 rounded-full blur-2xl transform translate-x-20 -translate-y-20 opacity-70"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-full blur-2xl transform -translate-x-10 translate-y-10 opacity-70"></div>

                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                    {t("profile.summary.title", "Rezumat profil")}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col items-center text-center pt-4 pb-6 relative z-10">
                  <div className="relative group">
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full opacity-70 blur-sm"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                    <Avatar className="h-28 w-28 mb-5 border-2 border-slate-700/50 relative z-10 ring-4 ring-slate-800">
                      <AvatarImage
                        src={formData.avatar_url || undefined}
                        alt={formData.full_name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white text-xl">
                        {formData.full_name
                          ? formData.full_name.substring(0, 2).toUpperCase()
                          : user.email?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleAvatarChange}
                      className="absolute bottom-4 right-0 bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                    >
                      <Camera className="h-4 w-4" />
                    </motion.button>
                  </div>

                  <h3 className="text-xl font-semibold mb-1 text-white">
                    {formData.full_name || user.email?.split("@")[0]}
                  </h3>

                  <div className="h-0.5 w-16 bg-gradient-to-r from-indigo-500/50 to-blue-500/50 rounded-full my-2"></div>

                  <p className="text-indigo-400 mb-4 font-medium">
                    {formData.job_title ||
                      t("profile.summary.noJobTitle", "Fără titlu job")}
                  </p>

                  <div className="space-y-3 w-full bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30">
                    <p className="text-slate-300 text-sm mb-1 flex items-center justify-center gap-2">
                      <span className="p-1.5 rounded-md bg-indigo-500/10">
                        <Mail className="h-4 w-4 text-indigo-400" />
                      </span>
                      {user.email}
                    </p>
                    {formData.phone && (
                      <p className="text-slate-300 text-sm flex items-center justify-center gap-2">
                        <span className="p-1.5 rounded-md bg-blue-500/10">
                          <Phone className="h-4 w-4 text-blue-400" />
                        </span>
                        {formData.phone}
                      </p>
                    )}
                    {formData.location && (
                      <p className="text-slate-300 text-sm flex items-center justify-center gap-2">
                        <span className="p-1.5 rounded-md bg-cyan-500/10">
                          <MapPin className="h-4 w-4 text-cyan-400" />
                        </span>
                        {formData.location}
                      </p>
                    )}
                  </div>

                  {formData.skills.length > 0 && (
                    <div className="mt-6 w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-4 w-0.5 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full"></div>
                        <h4 className="text-sm font-medium text-white">
                          {t("profile.summary.skills", "Competențe")}
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Badge className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 text-blue-300 border-slate-700/50 transition-colors">
                              {skill}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabs Section */}
              <div className="md:w-2/3">
                <Tabs
                  defaultValue="profile"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-6 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-1 rounded-xl">
                    <TabsTrigger
                      value="profile"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/80 data-[state=active]:to-blue-600/80 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 relative overflow-hidden group"
                    >
                      {/* Active tab glow effect */}
                      {activeTab === "profile" && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 blur-sm"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        />
                      )}

                      <span className="relative z-10 flex items-center">
                        <span
                          className={`p-1 rounded-md ${
                            activeTab === "profile"
                              ? "bg-white/10"
                              : "bg-slate-700/50 group-hover:bg-slate-700"
                          } mr-2`}
                        >
                          <User className="h-4 w-4" />
                        </span>
                        {t("profile.tabs.profile", "Profil")}
                      </span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="settings"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600/80 data-[state=active]:to-blue-600/80 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 relative overflow-hidden group"
                    >
                      {/* Active tab glow effect */}
                      {activeTab === "settings" && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 blur-sm"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        />
                      )}

                      <span className="relative z-10 flex items-center">
                        <span
                          className={`p-1 rounded-md ${
                            activeTab === "settings"
                              ? "bg-white/10"
                              : "bg-slate-700/50 group-hover:bg-slate-700"
                          } mr-2`}
                        >
                          <Settings className="h-4 w-4" />
                        </span>
                        {t("profile.tabs.settings", "Setări")}
                      </span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="security"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 relative overflow-hidden group"
                    >
                      {/* Active tab glow effect */}
                      {activeTab === "security" && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 blur-sm"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        />
                      )}

                      <span className="relative z-10 flex items-center">
                        <span
                          className={`p-1 rounded-md ${
                            activeTab === "security"
                              ? "bg-white/10"
                              : "bg-slate-700/50 group-hover:bg-slate-700"
                          } mr-2`}
                        >
                          <Shield className="h-4 w-4" />
                        </span>
                        {t("profile.tabs.security", "Securitate")}
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle>
                          {t(
                            "profile.personalInfo.title",
                            "Informații personale"
                          )}
                        </CardTitle>
                        <CardDescription>
                          {t(
                            "profile.personalInfo.description",
                            "Actualizează-ți informațiile personale aici."
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="full_name">
                              {t(
                                "profile.personalInfo.fullName",
                                "Nume complet"
                              )}
                            </Label>
                            <Input
                              id="full_name"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleInputChange}
                              placeholder={t(
                                "profile.personalInfo.fullNamePlaceholder",
                                "Introdu numele tău complet"
                              )}
                              className="bg-slate-700 border-slate-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="job_title">
                              {t("profile.personalInfo.jobTitle", "Titlu job")}
                            </Label>
                            <Input
                              id="job_title"
                              name="job_title"
                              value={formData.job_title}
                              onChange={handleInputChange}
                              placeholder={t(
                                "profile.personalInfo.jobTitlePlaceholder",
                                "Introdu titlul jobului tău"
                              )}
                              className="bg-slate-700 border-slate-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">
                              {t(
                                "profile.personalInfo.phone",
                                "Număr de telefon"
                              )}
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder={t(
                                "profile.personalInfo.phonePlaceholder",
                                "Introdu numărul tău de telefon"
                              )}
                              className="bg-slate-700 border-slate-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">
                              {t("profile.personalInfo.location", "Locație")}
                            </Label>
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              placeholder={t(
                                "profile.personalInfo.locationPlaceholder",
                                "Introdu locația ta"
                              )}
                              className="bg-slate-700 border-slate-600"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">
                            {t("profile.personalInfo.bio", "Biografie")}
                          </Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder={t(
                              "profile.personalInfo.bioPlaceholder",
                              "Scrie câteva detalii despre tine"
                            )}
                            className="bg-slate-700 border-slate-600 min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="skills">
                            {t("profile.personalInfo.skills", "Competențe")}
                          </Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {formData.skills.map((skill, index) => (
                              <Badge
                                key={index}
                                className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-700 cursor-pointer"
                                onClick={() => handleRemoveSkill(skill)}
                              >
                                {skill} ×
                              </Badge>
                            ))}
                          </div>
                          <form
                            onSubmit={handleAddSkill}
                            className="flex gap-2"
                          >
                            <Input
                              id="newSkill"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              placeholder={t(
                                "profile.personalInfo.skillsPlaceholder",
                                "Adaugă o competență nouă"
                              )}
                              className="bg-slate-700 border-slate-600"
                            />
                            <Button type="submit" size="sm">
                              {t("profile.personalInfo.addSkill", "Adaugă")}
                            </Button>
                          </form>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving
                            ? t("common.saving", "Se salvează...")
                            : t("common.save", "Salvează modificările")}
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle>
                          {t("profile.preferences.title", "Preferințe")}
                        </CardTitle>
                        <CardDescription>
                          {t(
                            "profile.preferences.description",
                            "Personalizează experiența ta în aplicație."
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>
                              {t("profile.preferences.theme", "Temă")}
                            </Label>
                            <p className="text-sm text-slate-400">
                              {t(
                                "profile.preferences.themeDescription",
                                "Alege tema preferată pentru interfață."
                              )}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={
                                formData.theme_preference === "light"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleSelectChange("light", "theme_preference")
                              }
                              className="h-8 gap-1"
                            >
                              <Sun className="h-4 w-4" />
                              {t("profile.preferences.light", "Luminos")}
                            </Button>
                            <Button
                              variant={
                                formData.theme_preference === "dark"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleSelectChange("dark", "theme_preference")
                              }
                              className="h-8 gap-1"
                            >
                              <Moon className="h-4 w-4" />
                              {t("profile.preferences.dark", "Întunecat")}
                            </Button>
                            <Button
                              variant={
                                formData.theme_preference === "system"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleSelectChange("system", "theme_preference")
                              }
                              className="h-8"
                            >
                              {t("profile.preferences.system", "Sistem")}
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>
                              {t("profile.preferences.language", "Limbă")}
                            </Label>
                            <p className="text-sm text-slate-400">
                              {t(
                                "profile.preferences.languageDescription",
                                "Selectează limba preferată pentru interfață."
                              )}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={
                                formData.language_preference === "en"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleSelectChange("en", "language_preference")
                              }
                              className="h-8"
                            >
                              English
                            </Button>
                            <Button
                              variant={
                                formData.language_preference === "ro"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleSelectChange("ro", "language_preference")
                              }
                              className="h-8"
                            >
                              Română
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email_notifications">
                              {t(
                                "profile.preferences.emailNotifications",
                                "Notificări email"
                              )}
                            </Label>
                            <p className="text-sm text-slate-400">
                              {t(
                                "profile.preferences.emailNotificationsDescription",
                                "Primește notificări importante prin email."
                              )}
                            </p>
                          </div>
                          <Switch
                            id="email_notifications"
                            checked={formData.email_notifications}
                            onCheckedChange={(checked) =>
                              handleSwitchChange(checked, "email_notifications")
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="mobile_notifications">
                              {t(
                                "profile.preferences.mobileNotifications",
                                "Notificări mobile"
                              )}
                            </Label>
                            <p className="text-sm text-slate-400">
                              {t(
                                "profile.preferences.mobileNotificationsDescription",
                                "Primește notificări push pe dispozitivul mobil."
                              )}
                            </p>
                          </div>
                          <Switch
                            id="mobile_notifications"
                            checked={formData.mobile_notifications}
                            onCheckedChange={(checked) =>
                              handleSwitchChange(
                                checked,
                                "mobile_notifications"
                              )
                            }
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving
                            ? t("common.saving", "Se salvează...")
                            : t("common.save", "Salvează modificările")}
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle>
                          {t("profile.security.title", "Setări de securitate")}
                        </CardTitle>
                        <CardDescription>
                          {t(
                            "profile.security.description",
                            "Gestionează setările de securitate ale contului tău."
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current_password">
                            {t(
                              "profile.security.currentPassword",
                              "Parola actuală"
                            )}
                          </Label>
                          <Input
                            id="current_password"
                            name="current_password"
                            type="password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new_password">
                              {t("profile.security.newPassword", "Parolă nouă")}
                            </Label>
                            <Input
                              id="new_password"
                              name="new_password"
                              type="password"
                              value={passwordData.new_password}
                              onChange={handlePasswordChange}
                              placeholder="••••••••"
                              className="bg-slate-700 border-slate-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm_password">
                              {t(
                                "profile.security.confirmPassword",
                                "Confirmă parola nouă"
                              )}
                            </Label>
                            <Input
                              id="confirm_password"
                              name="confirm_password"
                              type="password"
                              value={passwordData.confirm_password}
                              onChange={handlePasswordChange}
                              placeholder="••••••••"
                              className="bg-slate-700 border-slate-600"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-sm text-slate-400">
                            {t(
                              "profile.security.passwordRequirements",
                              "Parola trebuie să conțină cel puțin 6 caractere și să includă o combinație de litere, cifre și caractere speciale."
                            )}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={handleChangePassword}
                          disabled={isSaving}
                        >
                          {isSaving
                            ? t("common.updating", "Se actualizează...")
                            : t(
                                "profile.security.changePassword",
                                "Schimbă parola"
                              )}
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle>
                          {t(
                            "profile.security.activeSessions",
                            "Sesiuni active"
                          )}
                        </CardTitle>
                        <CardDescription>
                          {t(
                            "profile.security.activeSessionsDescription",
                            "Gestionează dispozitivele conectate la contul tău."
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/20 p-2 rounded-full">
                                <Briefcase className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {t(
                                    "profile.security.thisDevice",
                                    "Acest dispozitiv"
                                  )}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {navigator.platform} •{" "}
                                  {navigator.userAgent.includes("Chrome")
                                    ? "Chrome"
                                    : "Browser"}{" "}
                                  •{" "}
                                  {t(
                                    "profile.security.currentLocation",
                                    "Locație curentă"
                                  )}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/20">
                              {t("profile.security.activeNow", "Activ acum")}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="border-slate-600 hover:bg-slate-700"
                        >
                          {t(
                            "profile.security.logoutAllDevices",
                            "Deconectează toate dispozitivele"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
