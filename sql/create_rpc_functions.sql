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
  -- Verificăm dacă utilizatorul este autentificat
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilizatorul nu este autentificat';
  END IF;
  
  -- Returnăm rolurile utilizatorilor
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
  -- Verificăm dacă utilizatorul este autentificat
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilizatorul nu este autentificat';
  END IF;
  
  -- Verificăm dacă utilizatorul are permisiunea de a actualiza roluri
  -- Această verificare poate fi adaptată în funcție de logica aplicației
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SITE_ADMIN')
  ) THEN
    RAISE EXCEPTION 'Nu aveți permisiunea de a actualiza roluri';
  END IF;
  
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
  
  -- Actualizăm și metadatele utilizatorului pentru a păstra rolul și acolo
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('role', p_role)
      ELSE 
        raw_user_meta_data || jsonb_build_object('role', p_role)
    END
  WHERE id = p_user_id;
END;
$$;

-- Asigurăm-ne că tabelul user_roles există
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adăugăm indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Activăm Row Level Security pentru tabelul user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Adăugăm politici RLS pentru tabelul user_roles
CREATE POLICY "Administratorii pot vedea toate rolurile" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SITE_ADMIN')
    )
  );

CREATE POLICY "Utilizatorii pot vedea doar rolul lor" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Doar administratorii pot actualiza roluri" ON user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SITE_ADMIN')
    )
  );

CREATE POLICY "Doar administratorii pot insera roluri" ON user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SITE_ADMIN')
    )
  );

CREATE POLICY "Doar administratorii pot șterge roluri" ON user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SITE_ADMIN')
    )
  );

-- Asigurăm-ne că tabelul site_admins există
CREATE TABLE IF NOT EXISTS site_admins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adăugăm indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_site_admins_user_id ON site_admins(user_id);

-- Activăm Row Level Security pentru tabelul site_admins
ALTER TABLE site_admins ENABLE ROW LEVEL SECURITY;

-- Adăugăm politici RLS pentru tabelul site_admins
CREATE POLICY "Toți utilizatorii pot vedea site_admins" ON site_admins
  FOR SELECT USING (true);

CREATE POLICY "Doar site_admins pot actualiza site_admins" ON site_admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM site_admins 
      WHERE user_id = auth.uid()
    )
  );

-- Adăugăm un trigger pentru a actualiza updated_at în tabelul user_roles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
