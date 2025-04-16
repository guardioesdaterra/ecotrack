    # Plano de Integração com Supabase

## 1. Estrutura do Banco de Dados

### Tabela `activities`
```sql
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users
);
```

### Tabela `activity_updates`
```sql
CREATE TABLE activity_updates (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES activities(id),
  description TEXT,
  photos TEXT[], -- URLs das imagens no Storage
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Storage
- Bucket `activity-images` para fotos principais
- Bucket `update-images` para fotos de updates

## 2. Modificações no Formulário

1. **Autenticação**:
   - Usar `supabase.auth` para gerenciar login
   - Obter user_id do usuário logado

2. **Upload de Imagens**:
```typescript
async function uploadImage(file: File, bucket: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) throw error;

  return data.path;
}
```

3. **Envio do Formulário**:
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // 1. Upload da imagem
    let imagePath = null;
    if (formState.image) {
      imagePath = await uploadImage(formState.image, 'activity-images');
    }

    // 2. Inserir atividade
    const { data, error } = await supabase
      .from('activities')
      .insert({
        title: formState.title,
        type: formState.type,
        description: formState.description,
        lat: parseFloat(formState.latitude),
        lng: parseFloat(formState.longitude),
        image_url: imagePath ? `${supabaseUrl}/storage/v1/object/public/activity-images/${imagePath}` : null
      })
      .select();

    if (error) throw error;

    setIsSuccess(true);
  } catch (error) {
    console.error('Submission error:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

## 3. Próximos Passos

1. Criar as tabelas no Supabase
2. Configurar políticas de acesso
3. Implementar o código acima no formulário
4. Testar o fluxo completo