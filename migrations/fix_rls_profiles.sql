-- ==========================================
-- FIX RLS POLICIES - PROFILES
-- Execute no Supabase SQL Editor
-- ==========================================

-- Remover todas as políticas antigas de profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- NOVA POLÍTICA: Usuário pode ver seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

-- NOVA POLÍTICA: Admin pode ver todos os perfis
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- NOVA POLÍTICA: Usuário pode atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- NOVA POLÍTICA: Admin pode atualizar qualquer perfil
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- NOVA POLÍTICA: Sistema pode inserir novos perfis (para o trigger)
CREATE POLICY "Service can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- ==========================================
-- VERIFICAR POLÍTICAS ATUAIS
-- ==========================================
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
