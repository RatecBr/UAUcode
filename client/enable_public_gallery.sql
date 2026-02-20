-- Adiciona coluna is_public na tabela targets se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'targets' AND column_name = 'is_public') THEN
        ALTER TABLE targets ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Garante que o RLS permita leitura pública para itens públicos
DROP POLICY IF EXISTS "Public targets are viewable by everyone" ON targets;
CREATE POLICY "Public targets are viewable by everyone" ON targets FOR SELECT USING (is_public = true);
