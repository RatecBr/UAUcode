# UAU Code - Documentação Técnica Completa

## 📋 Índice

1. [Arquitetura](#arquitetura)
2. [Frontend](#frontend)
3. [Backend (Supabase)](#backend-supabase)
4. [Reconhecimento de Imagens](#reconhecimento-de-imagens)
5. [Autenticação e Autorização](#autenticação-e-autorização)
6. [Storage e Assets](#storage-e-assets)
7. [Performance](#performance)
8. [Deploy](#deploy)
9. [Troubleshooting](#troubleshooting)

---

## 1. Arquitetura

### Stack Tecnológico

```
Frontend:
├── React 18.3.1
├── TypeScript 5.6.2
├── Vite 6.0.11
├── React Router DOM 7.1.1
└── Lucide React (ícones)

Backend:
├── Supabase (BaaS)
│   ├── PostgreSQL 15
│   ├── GoTrue (Auth)
│   ├── PostgREST (API)
│   └── Storage (S3-compatible)

Reconhecimento:
└── OpenCV.js 4.10.0 (WebAssembly)
```

### Fluxo de Dados

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌──────────────┐                    ┌──────────────┐
│  OpenCV.js   │                    │   Supabase   │
│   (Local)    │                    │   (Cloud)    │
└──────────────┘                    └──────┬───────┘
                                           │
                                    ┌──────┴───────┐
                                    │              │
                                    ▼              ▼
                            ┌──────────┐   ┌──────────┐
                            │ Database │   │ Storage  │
                            └──────────┘   └──────────┘
```

---

## 2. Frontend

### Estrutura de Componentes

```
App.tsx
├── Landing.tsx (/)
├── Login.tsx (/login)
├── Dashboard.tsx (/dashboard) [Protected]
│   ├── MediaCapture
│   ├── QRCodeGenerator
│   └── TargetCard
├── Scanner.tsx (/scanner) [Protected]
│   └── Overlays (Video, Audio, 3D)
└── PublicScanner.tsx (/s/:slug)
    └── Overlays (Video, Audio, 3D)
├── Terms.tsx (/terms)
└── Privacy.tsx (/privacy)
```

### Roteamento

```typescript
// src/App.tsx
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
  <Route path="/s/:slug" element={<PublicScanner />} />
  <Route path="/terms" element={<Terms />} />
  <Route path="/privacy" element={<Privacy />} />
  <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
</Routes>
```

### AuthContext

```typescript
// src/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Uso
const { user, profile } = useAuth();
```

### Variáveis de Ambiente

```env
# .env
VITE_SUPABASE_URL=https://nqpkttlgdjpduytebndy.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 3. Backend (Supabase)

### Schema SQL

```sql
-- Profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Targets
CREATE TABLE public.targets (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', '3d')),
    content_url TEXT NOT NULL,
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan Logs
CREATE TABLE public.scan_logs (
    id BIGSERIAL PRIMARY KEY,
    target_id BIGINT NOT NULL REFERENCES public.targets(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT
);
```

### RLS Policies

```sql
-- Profiles: Users can view own
CREATE POLICY "Users can view own profiles"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Profiles: Public can view by slug
CREATE POLICY "Public can view profiles by slug"
ON public.profiles FOR SELECT
USING (true);

-- Targets: Users can CRUD own
CREATE POLICY "Users can insert own targets"
ON public.targets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own targets"
ON public.targets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own targets"
ON public.targets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own targets"
ON public.targets FOR DELETE
USING (auth.uid() = user_id);

-- Targets: Public can view by user slug
CREATE POLICY "Public can view targets by user slug"
ON public.targets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = targets.user_id
  )
);

-- Scan Logs: Anyone can insert
CREATE POLICY "Anyone can insert scan logs"
ON public.scan_logs FOR INSERT
WITH CHECK (true);

-- Scan Logs: Owners can view
CREATE POLICY "Owners can view scan logs"
ON public.scan_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.targets
    WHERE targets.id = scan_logs.target_id
    AND targets.user_id = auth.uid()
  )
);
```

### Funções Auxiliares

```sql
-- Verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. Reconhecimento de Imagens

### OpenCV.js Setup

```html
<!-- index.html -->
<script src="/opencv.js"></script>
```

```typescript
// Aguardar carregamento
declare const cv: any;

function waitForOpenCV(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof cv !== "undefined" && cv.getBuildInformation) {
      resolve();
    } else {
      setTimeout(() => waitForOpenCV().then(resolve), 100);
    }
  });
}
```

### Algoritmo de Detecção

```typescript
// Scanner.tsx
const detectTarget = (
  videoElement: HTMLVideoElement,
  targetImage: HTMLImageElement,
) => {
  // 1. Capturar frame do vídeo
  const src = new cv.Mat(videoElement.height, videoElement.width, cv.CV_8UC4);
  const cap = new cv.VideoCapture(videoElement);
  cap.read(src);

  // 2. Converter para grayscale
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // 3. Detectar features (ORB)
  const orb = new cv.ORB(500);
  const keypoints = new cv.KeyPointVector();
  const descriptors = new cv.Mat();
  orb.detectAndCompute(gray, new cv.Mat(), keypoints, descriptors);

  // 4. Comparar com target
  const matcher = new cv.BFMatcher(cv.NORM_HAMMING, true);
  const matches = new cv.DMatchVector();
  matcher.match(descriptors, targetDescriptors, matches);

  // 5. Filtrar bons matches
  const goodMatches = [];
  for (let i = 0; i < matches.size(); i++) {
    if (matches.get(i).distance < 50) {
      goodMatches.push(matches.get(i));
    }
  }

  // 6. Threshold de detecção
  const isDetected = goodMatches.length > 10;

  // Cleanup
  src.delete();
  gray.delete();
  keypoints.delete();
  descriptors.delete();
  matches.delete();

  return isDetected;
};
```

### Performance

- **FPS**: 10-15 fps (requestAnimationFrame)
- **Resolução**: 640x480 (otimizado para mobile)
- **Threshold**: 10+ matches para detecção confiável

---

## 5. Autenticação e Autorização

### Fluxo de Login

```
1. Usuário → email + senha (ou Google OAuth - *configuração pendente*)
2. Supabase Auth → JWT token
3. AuthContext → atualiza estado
4. Fetch profile → Supabase DB
5. Redirect → /dashboard
```

### Proteção de Rotas

```typescript
// ProtectedRoute.tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};
```

### Roles

| Role      | Permissões                                 |
| --------- | ------------------------------------------ |
| **user**  | CRUD próprias experiências, scanner        |
| **admin** | Tudo + gestão de usuários + global targets |

---

## 6. Storage e Assets

### Buckets

```
assets/ (público)
├── target-images/
│   └── {user_id}/{target_id}.jpg
└── content-files/
    └── {user_id}/{target_id}.{mp4|mp3|glb}
```

### Upload Flow

```typescript
// Dashboard.tsx
const uploadFile = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from("assets")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("assets").getPublicUrl(path);

  return publicUrl;
};
```

### Políticas Storage

```sql
-- Public read
CREATE POLICY "Public Access Assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Auth upload
CREATE POLICY "Auth Upload Assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

-- Auth update
CREATE POLICY "Auth Update Assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'assets' AND auth.role() = 'authenticated');

-- Auth delete
CREATE POLICY "Auth Delete Assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'assets' AND auth.role() = 'authenticated');
```

---

## 7. Performance

### Otimizações Frontend

```typescript
// Lazy loading de componentes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Scanner = lazy(() => import('./pages/Scanner'));

// Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Otimizações OpenCV

```typescript
// Reduzir resolução
const constraints = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: "environment",
  },
};

// Throttle de detecção
const detectWithThrottle = throttle(detectTarget, 100); // 10 fps
```

### Caching

```typescript
// Service Worker (PWA)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
```

---

## 8. Deploy

### GitHub Flow (Produção)

1.  **Commit**: Realize os commits das suas alterações localmente.
2.  **Push**: Envie as alterações para a branch `main` do repositório remoto.
    ```bash
    git push origin main
    ```
3.  **Automatic Deploy**: O Vercel detectará automaticamente o push e iniciará o build e deploy.

> **Nota Crítica**: Nunca utilize o comando `vercel --prod` diretamente. O deploy deve ser sempre rastreável via histórico do Git.

**Environment Variables**:

```
VITE_SUPABASE_URL=https://nqpkttlgdjpduytebndy.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Netlify (Alternativa)

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 9. Troubleshooting

### Câmera não funciona

**Problema**: `NotAllowedError: Permission denied`

**Solução**:

1. Verificar HTTPS (obrigatório)
2. Verificar permissões do navegador
3. Testar em outro navegador

### OpenCV não carrega

**Problema**: `cv is not defined`

**Solução**:

```typescript
// Aguardar carregamento
await waitForOpenCV();
```

### RLS Policy Error

**Problema**: `new row violates row-level security policy`

**Solução**:

1. Verificar se usuário está autenticado
2. Verificar se policy permite operação
3. Checar `auth.uid()` no SQL

### Upload falha

**Problema**: `Storage bucket not found`

**Solução**:

1. Verificar nome do bucket (`assets`)
2. Verificar políticas de storage
3. Verificar tamanho do arquivo (max 50MB)

---

## 📊 Métricas de Sucesso

- **Tempo de Detecção**: < 2s
- **Taxa de Acerto**: > 90%
- **FPS Scanner**: 10-15 fps
- **Lighthouse Score**: > 90
- **Core Web Vitals**: Todos verdes

---

## 🔒 Segurança

### Checklist

- [x] RLS habilitado em todas as tabelas
- [x] HTTPS obrigatório
- [x] JWT tokens com expiração
- [x] Storage com políticas públicas apenas para leitura
- [x] Validação de input no frontend
- [x] Rate limiting (Supabase)
- [x] CORS configurado

---

## 🚀 Roadmap

### v1.4.0 (Próximo)

- [ ] Analytics dashboard
- [ ] Notificações push
- [ ] Modo offline (PWA)
- [ ] Exportar relatórios

### v2.0.0 (Futuro)

- [ ] IA para geração de conteúdo
- [ ] Marketplace de experiências
- [ ] API pública
- [ ] White-label

---

_Última atualização: 18 de fevereiro de 2026_
