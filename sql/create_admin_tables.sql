-- Crearea tabelului pentru stocarea activităților utilizatorilor
CREATE TABLE IF NOT EXISTS user_activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  status TEXT CHECK (status IN ('success', 'warning', 'error', 'info')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adăugăm indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_action ON user_activities(action);
CREATE INDEX IF NOT EXISTS idx_user_activities_status ON user_activities(status);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- Crearea tabelului pentru stocarea stării componentelor sistemului
CREATE TABLE IF NOT EXISTS health_check (
  id BIGSERIAL PRIMARY KEY,
  component TEXT NOT NULL,
  status TEXT CHECK (status IN ('healthy', 'warning', 'error')),
  message TEXT,
  response_time FLOAT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adăugăm indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_health_check_component ON health_check(component);
CREATE INDEX IF NOT EXISTS idx_health_check_status ON health_check(status);
CREATE INDEX IF NOT EXISTS idx_health_check_checked_at ON health_check(checked_at);

-- Crearea tabelului pentru stocarea setărilor sistemului
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adăugăm indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Inserăm setări implicite pentru sistem
INSERT INTO system_settings (key, value, description, category) VALUES
-- Setări generale
('site_name', 'InventoryPro', 'Numele site-ului', 'general'),
('site_description', 'Sistem de management al inventarului', 'Descrierea site-ului', 'general'),
('maintenance_mode', 'false', 'Activează modul de mentenanță', 'general'),
('default_language', 'ro', 'Limba implicită a site-ului', 'general'),
('default_timezone', 'Europe/Bucharest', 'Fusul orar implicit', 'general'),

-- Setări pentru email
('smtp_host', 'smtp.example.com', 'Gazda SMTP pentru trimiterea email-urilor', 'email'),
('smtp_port', '587', 'Portul SMTP', 'email'),
('smtp_user', 'user@example.com', 'Utilizatorul SMTP', 'email'),
('smtp_password', '', 'Parola SMTP (criptată)', 'email'),
('email_from', 'noreply@example.com', 'Adresa de email pentru trimiterea notificărilor', 'email'),
('email_notifications_enabled', 'true', 'Activează notificările prin email', 'email'),

-- Setări pentru securitate
('max_login_attempts', '5', 'Numărul maxim de încercări de autentificare', 'security'),
('lockout_time', '30', 'Timpul de blocare după încercări eșuate (minute)', 'security'),
('password_expiry_days', '90', 'Numărul de zile după care parola expiră', 'security'),
('session_timeout', '60', 'Timpul de expirare a sesiunii (minute)', 'security'),
('require_2fa', 'false', 'Necesită autentificare în doi factori', 'security'),
('allowed_file_types', 'jpg,jpeg,png,pdf,doc,docx,xls,xlsx,csv', 'Tipuri de fișiere permise pentru încărcare', 'security'),

-- Setări pentru baza de date
('db_backup_enabled', 'true', 'Activează backup-ul automat al bazei de date', 'database'),
('db_backup_frequency', 'daily', 'Frecvența backup-ului (daily, weekly, monthly)', 'database'),
('db_backup_retention', '30', 'Numărul de zile pentru păstrarea backup-urilor', 'database'),
('db_max_connections', '100', 'Numărul maxim de conexiuni la baza de date', 'database'),

-- Setări pentru logging
('log_level', 'info', 'Nivelul de logging (debug, info, warning, error)', 'logging'),
('log_retention', '30', 'Numărul de zile pentru păstrarea log-urilor', 'logging'),
('audit_logging', 'true', 'Activează logging-ul de audit', 'logging'),
('performance_logging', 'true', 'Activează logging-ul de performanță', 'logging'),

-- Setări pentru storage
('max_upload_size', '10', 'Dimensiunea maximă pentru încărcări (MB)', 'storage'),
('storage_provider', 'local', 'Furnizorul de stocare (local, s3, etc.)', 'storage'),
('storage_path', '/uploads', 'Calea pentru stocarea fișierelor', 'storage'),
('image_compression', 'true', 'Activează compresia imaginilor', 'storage'),

-- Setări pentru notificări
('notification_expiry', '7', 'Numărul de zile pentru păstrarea notificărilor', 'notifications'),
('desktop_notifications', 'true', 'Activează notificările desktop', 'notifications'),
('notification_sound', 'true', 'Activează sunetul pentru notificări', 'notifications'),

-- Setări pentru aspect
('theme', 'dark', 'Tema implicită (light, dark)', 'appearance'),
('primary_color', '#3b82f6', 'Culoarea primară', 'appearance'),
('logo_url', '/logo.png', 'URL-ul logo-ului', 'appearance'),
('favicon_url', '/favicon.ico', 'URL-ul favicon-ului', 'appearance'),

-- Setări pentru localizare
('date_format', 'DD/MM/YYYY', 'Formatul datei', 'localization'),
('time_format', 'HH:mm', 'Formatul orei', 'localization'),
('currency', 'RON', 'Moneda implicită', 'localization'),
('number_format', '1.234,56', 'Formatul numerelor', 'localization'),

-- Setări pentru utilizatori
('allow_registration', 'true', 'Permite înregistrarea utilizatorilor', 'users'),
('default_role', 'user', 'Rolul implicit pentru utilizatorii noi', 'users'),
('require_email_verification', 'true', 'Necesită verificarea email-ului', 'users'),
('avatar_provider', 'gravatar', 'Furnizorul de avatare (gravatar, local, etc.)', 'users')
ON CONFLICT (key) DO NOTHING;

-- Funcție pentru obținerea rolurilor utilizatorilor
CREATE OR REPLACE FUNCTION get_user_roles()
RETURNS TABLE (
  user_id UUID,
  role TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(ur.role, 'utilizator') as role
  FROM 
    auth.users u
  LEFT JOIN 
    user_roles ur ON u.id = ur.user_id;
END;
$$;

-- Funcție pentru actualizarea rolului unui utilizator
CREATE OR REPLACE FUNCTION update_user_role(p_user_id UUID, p_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificăm dacă utilizatorul există
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Utilizatorul nu există';
  END IF;
  
  -- Verificăm dacă utilizatorul are deja un rol
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id) THEN
    -- Actualizăm rolul existent
    UPDATE user_roles
    SET role = p_role, updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Creăm un nou rol pentru utilizator
    INSERT INTO user_roles (user_id, role)
    VALUES (p_user_id, p_role);
  END IF;
END;
$$;

-- Trigger pentru a înregistra activitatea utilizatorilor
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_action TEXT;
  v_resource TEXT;
  v_details TEXT;
  v_status TEXT;
BEGIN
  -- Obținem email-ul utilizatorului
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Determinăm acțiunea, resursa și detaliile în funcție de operațiune
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_status := 'success';
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_status := 'success';
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_status := 'success';
  END IF;
  
  -- Determinăm resursa și detaliile în funcție de tabel
  v_resource := TG_TABLE_NAME;
  v_details := 'Operation: ' || TG_OP || ' on ' || TG_TABLE_NAME;
  
  -- Înregistrăm activitatea
  INSERT INTO user_activities (user_id, user_email, action, resource, details, status, ip_address)
  VALUES (auth.uid(), v_user_email, v_action, v_resource, v_details, v_status, NULL);
  
  RETURN NEW;
END;
$$;

-- Aplicăm trigger-ul pentru tabelele relevante
DROP TRIGGER IF EXISTS log_user_roles_activity ON user_roles;
CREATE TRIGGER log_user_roles_activity
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION log_user_activity();

DROP TRIGGER IF EXISTS log_system_settings_activity ON system_settings;
CREATE TRIGGER log_system_settings_activity
AFTER INSERT OR UPDATE OR DELETE ON system_settings
FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Politici RLS pentru tabelele create
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Politici pentru user_activities
CREATE POLICY "Administratorii pot vedea toate activitățile" ON user_activities
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Utilizatorii pot vedea doar activitățile lor" ON user_activities
  FOR SELECT USING (user_id = auth.uid());

-- Politici pentru health_check
CREATE POLICY "Administratorii pot gestiona starea componentelor" ON health_check
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Toți utilizatorii pot vedea starea componentelor" ON health_check
  FOR SELECT USING (true);

-- Politici pentru system_settings
CREATE POLICY "Administratorii pot gestiona setările sistemului" ON system_settings
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Toți utilizatorii pot vedea setările publice" ON system_settings
  FOR SELECT USING (category NOT IN ('security', 'database'));
