-- ==========================================
-- MAIPIX - CORREÇÃO COMPLETA DE RLS V3.0
-- Execute este script INTEIRO no Supabase SQL Editor
-- ==========================================

-- ===================
-- PASSO 1: DESABILITAR RLS TEMPORARIAMENTE
-- ===================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs DISABLE ROW LEVEL SECURITY;

-- ===================
-- PASSO 2: REMOVER TODAS AS POLÍTICAS ANTIGAS
-- ===================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Remover políticas de profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
    
    -- Remover políticas de targets
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'targets' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.targets';
    END LOOP;
    
    -- Remover políticas de scan_logs
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'scan_logs' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.scan_logs';
    END LOOP;
END $$;

-- ===================
-- PASSO 3: VERIFICAR/CORRIGIR ESTRUTURA DAS TABELAS
-- ===================

-- Profiles: garantir colunas necessárias
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Targets: garantir colunas necessárias
ALTER TABLE public.targets 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_global boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS scan_count integer DEFAULT 0;

-- Scan_logs: criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.scan_logs (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    target_id bigint REFERENCES public.targets(id) ON DELETE CASCADE NOT NULL,
    scanned_at timestamptz DEFAULT NOW(),
    device_info text,
    ip_hash text
);

-- ===================
-- PASSO 4: REABILITAR RLS
-- ===================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- ===================
-- PASSO 5: CRIAR POLÍTICAS NOVAS (SEM RECURSÃO)
-- ===================

-- ====== PROFILES ======

-- 5.1 Usuário pode ver seu próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles 
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 5.2 Usuário pode atualizar seu próprio perfil
CREATE POLICY "profiles_update_own" ON public.profiles 
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5.3 Acesso público para busca por slug (scanner público)
-- Permite buscar perfil por slug SEM estar logado
CREATE POLICY "profiles_select_by_slug_public" ON public.profiles
FOR SELECT TO anon
USING (is_active = true);

-- ====== TARGETS ======

-- 5.4 Usuário vê seus próprios targets
CREATE POLICY "targets_select_own" ON public.targets
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 5.5 Acesso público para targets (scanner público)
-- Permite ver targets de usuários ativos OU targets globais
CREATE POLICY "targets_select_public" ON public.targets
FOR SELECT TO anon
USING (
    is_global = true 
    OR user_id IN (SELECT id FROM public.profiles WHERE is_active = true)
);

-- 5.6 Autenticado também pode ver targets públicos/globais
CREATE POLICY "targets_select_public_auth" ON public.targets
FOR SELECT TO authenticated
USING (is_global = true);

-- 5.7 Usuário pode inserir targets com seu próprio ID
CREATE POLICY "targets_insert_own" ON public.targets
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 5.8 Usuário pode atualizar seus próprios targets
CREATE POLICY "targets_update_own" ON public.targets
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5.9 Usuário pode deletar seus próprios targets
CREATE POLICY "targets_delete_own" ON public.targets
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ====== SCAN_LOGS ======

-- 5.10 Qualquer um pode inserir scan logs (público)
CREATE POLICY "scan_logs_insert_public" ON public.scan_logs
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- 5.11 Dono do target pode ver seus logs
CREATE POLICY "scan_logs_select_own" ON public.scan_logs
FOR SELECT TO authenticated
USING (
    target_id IN (SELECT id FROM public.targets WHERE user_id = auth.uid())
);

-- ===================
-- PASSO 6: POLÍTICAS ESPECIAIS PARA ADMIN
-- Usamos uma abordagem diferente: funções com SECURITY DEFINER
-- ===================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Política para admin ver todos os perfis
CREATE POLICY "profiles_select_admin" ON public.profiles
FOR SELECT TO authenticated
USING (public.is_admin());

-- Política para admin atualizar qualquer perfil
CREATE POLICY "profiles_update_admin" ON public.profiles
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Política para admin ver todos os targets
CREATE POLICY "targets_select_admin" ON public.targets
FOR SELECT TO authenticated
USING (public.is_admin());

-- Política para admin atualizar qualquer target
CREATE POLICY "targets_update_admin" ON public.targets
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Política para admin deletar qualquer target
CREATE POLICY "targets_delete_admin" ON public.targets
FOR DELETE TO authenticated
USING (public.is_admin());

-- Política para admin ver todos os scan_logs
CREATE POLICY "scan_logs_select_admin" ON public.scan_logs
FOR SELECT TO authenticated
USING (public.is_admin());

-- ===================
-- PASSO 7: TRIGGER PARA NOVOS USUÁRIOS
-- ===================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, plan, slug, is_active)
    VALUES (
        NEW.id, 
        NEW.email, 
        'user', 
        'free',
        LOWER(REPLACE(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ''), '_', '')),
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ===================
-- PASSO 8: CORRIGIR DADOS EXISTENTES
-- ===================

-- Garantir que todos os perfis tenham slug
UPDATE public.profiles 
SET slug = LOWER(REPLACE(REPLACE(SPLIT_PART(email, '@', 1), '.', ''), '_', ''))
WHERE slug IS NULL OR slug = '';

-- Garantir que todos os perfis estejam ativos
UPDATE public.profiles 
SET is_active = true 
WHERE is_active IS NULL;

-- Garantir que todos os perfis tenham plano
UPDATE public.profiles 
SET plan = 'free' 
WHERE plan IS NULL;

-- Associar targets órfãos ao primeiro admin
UPDATE public.targets 
SET user_id = (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE user_id IS NULL;

-- ===================
-- PASSO 9: VERIFICAÇÃO FINAL
-- ===================

-- Mostrar perfis
SELECT 
    id,
    email,
    role,
    plan,
    slug,
    is_active
FROM public.profiles;

-- Mostrar políticas ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
