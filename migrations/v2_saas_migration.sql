-- ==========================================
-- MAIPIX SAAS MIGRATION V2.0
-- Execute no Supabase SQL Editor
-- ==========================================

-- ===================
-- FASE 1: PROFILES
-- ===================

-- 1.1 Adicionar novas colunas em profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 1.2 Criar índice para busca rápida por slug
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- 1.3 Gerar slug automático para usuários existentes (baseado no email)
UPDATE public.profiles 
SET slug = LOWER(REPLACE(SPLIT_PART(email, '@', 1), '.', ''))
WHERE slug IS NULL;

-- ===================
-- FASE 2: TARGETS
-- ===================

-- 2.1 Adicionar novas colunas em targets
ALTER TABLE public.targets 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_global boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS scan_count integer DEFAULT 0;

-- 2.2 Criar índice para busca rápida por user_id
CREATE INDEX IF NOT EXISTS idx_targets_user_id ON public.targets(user_id);

-- 2.3 Associar targets existentes ao primeiro admin (migração de dados legado)
UPDATE public.targets 
SET user_id = (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE user_id IS NULL;

-- ===================
-- FASE 3: SCAN_LOGS
-- ===================

-- 3.1 Criar tabela de logs de escaneamento
CREATE TABLE IF NOT EXISTS public.scan_logs (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    target_id bigint REFERENCES public.targets(id) ON DELETE CASCADE NOT NULL,
    scanned_at timestamptz DEFAULT NOW(),
    device_info text,
    ip_hash text -- Hash do IP para privacidade
);

-- 3.2 Índice para consultas de estatísticas
CREATE INDEX IF NOT EXISTS idx_scan_logs_target_id ON public.scan_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_at ON public.scan_logs(scanned_at);

-- 3.3 Habilitar RLS
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- ===================
-- FASE 4: RLS POLICIES (ATUALIZADAS)
-- ===================

-- 4.1 PROFILES - Políticas
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Usuário vê seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- Admin vê todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.profiles 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Usuário atualiza seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- Admin atualiza qualquer perfil
CREATE POLICY "Admins can update any profile" ON public.profiles 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4.2 TARGETS - Políticas
DROP POLICY IF EXISTS "Public targets are viewable by everyone" ON public.targets;
DROP POLICY IF EXISTS "Authenticated users can insert targets" ON public.targets;
DROP POLICY IF EXISTS "Authenticated users can update targets" ON public.targets;
DROP POLICY IF EXISTS "Authenticated users can delete targets" ON public.targets;

-- SELECT: Usuário vê seus targets, Admin vê todos, OU target é global
CREATE POLICY "Users can view own targets" ON public.targets 
FOR SELECT USING (
    user_id = auth.uid() 
    OR is_global = true
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SELECT público (para scanner sem login) - busca por slug do usuário
CREATE POLICY "Public can view targets by user slug" ON public.targets
FOR SELECT USING (
    user_id IN (
        SELECT id FROM public.profiles WHERE is_active = true
    )
);

-- INSERT: Usuário insere com seu ID, respeitando limite do plano
CREATE POLICY "Users can insert own targets" ON public.targets 
FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

-- UPDATE: Usuário atualiza seus targets OU admin atualiza qualquer um
CREATE POLICY "Users can update own targets" ON public.targets 
FOR UPDATE USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- DELETE: Usuário deleta seus targets OU admin deleta qualquer um
CREATE POLICY "Users can delete own targets" ON public.targets 
FOR DELETE USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4.3 SCAN_LOGS - Políticas
DROP POLICY IF EXISTS "Anyone can insert scan logs" ON public.scan_logs;
DROP POLICY IF EXISTS "Owners can view scan logs" ON public.scan_logs;

-- Qualquer um pode registrar um scan (público)
CREATE POLICY "Anyone can insert scan logs" ON public.scan_logs 
FOR INSERT WITH CHECK (true);

-- Dono do target ou admin pode ver logs
CREATE POLICY "Owners can view scan logs" ON public.scan_logs 
FOR SELECT USING (
    target_id IN (SELECT id FROM public.targets WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ===================
-- FASE 5: FUNÇÕES AUXILIARES
-- ===================

-- 5.1 Função para verificar limite de experiências por plano
CREATE OR REPLACE FUNCTION public.check_target_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_plan text;
    current_count integer;
    max_limit integer;
BEGIN
    -- Buscar plano do usuário
    SELECT plan INTO user_plan FROM public.profiles WHERE id = NEW.user_id;
    
    -- Contar targets atuais
    SELECT COUNT(*) INTO current_count FROM public.targets WHERE user_id = NEW.user_id;
    
    -- Definir limite por plano
    CASE user_plan
        WHEN 'free' THEN max_limit := 1;
        WHEN 'pro' THEN max_limit := 20;
        WHEN 'enterprise' THEN max_limit := 999999;
        ELSE max_limit := 1;
    END CASE;
    
    -- Verificar limite
    IF current_count >= max_limit THEN
        RAISE EXCEPTION 'Limite de experiências atingido para o plano %', user_plan;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 Trigger para verificar limite antes de inserir
DROP TRIGGER IF EXISTS check_target_limit_trigger ON public.targets;
CREATE TRIGGER check_target_limit_trigger
    BEFORE INSERT ON public.targets
    FOR EACH ROW
    EXECUTE FUNCTION public.check_target_limit();

-- 5.3 Função para incrementar contador de scans
CREATE OR REPLACE FUNCTION public.increment_scan_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.targets 
    SET scan_count = scan_count + 1 
    WHERE id = NEW.target_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.4 Trigger para incrementar scan_count automaticamente
DROP TRIGGER IF EXISTS increment_scan_count_trigger ON public.scan_logs;
CREATE TRIGGER increment_scan_count_trigger
    AFTER INSERT ON public.scan_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_scan_count();

-- 5.5 Atualizar trigger de criação de perfil para incluir slug
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, plan, slug, is_active)
    VALUES (
        NEW.id, 
        NEW.email, 
        'user', 
        'free',
        LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '')),
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- FIM DA MIGRAÇÃO
-- ===================

-- Verificar estrutura final
SELECT 
    'profiles' as table_name,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
UNION ALL
SELECT 
    'targets' as table_name,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'targets' AND table_schema = 'public'
UNION ALL
SELECT 
    'scan_logs' as table_name,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'scan_logs' AND table_schema = 'public'
ORDER BY table_name, column_name;
