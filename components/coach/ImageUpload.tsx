'use client'

// components/coach/ImageUpload.tsx
// Componente reutilizável de upload de imagem para Supabase Storage.
// Upload direto do browser → Storage → retorna URL pública via callback.
//
// Uso:
//   <ImageUpload
//     bucket="avatars"
//     storagePath={`${userId}/avatar`}
//     currentUrl={currentAvatarUrl}
//     aspectRatio="square"
//     label="Foto de perfil"
//     onUploaded={(url) => setAvatarUrl(url)}
//   />

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type AspectRatio = 'square' | 'cover'

interface Props {
  bucket: 'avatars' | 'covers'
  storagePath: string          // ex: "{userId}/avatar" ou "{userId}/cover"
  currentUrl: string | null
  aspectRatio: AspectRatio
  label: string
  hint?: string
  onUploaded: (publicUrl: string) => void
}

const MAX_SIZE: Record<Props['bucket'], number> = {
  avatars: 2 * 1024 * 1024,  // 2 MB
  covers:  5 * 1024 * 1024,  // 5 MB
}

const ACCEPT = 'image/jpeg,image/png,image/webp'

export function ImageUpload({
  bucket, storagePath, currentUrl, aspectRatio, label, hint, onUploaded,
}: Props) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const [preview, setPreview]   = useState<string | null>(currentUrl)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [uploaded, setUploaded] = useState(false)

  const isSquare = aspectRatio === 'square'

  async function handleFile(file: File) {
    setError(null)
    setUploaded(false)

    // Validações client-side
    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem (JPEG, PNG ou WebP).')
      return
    }
    if (file.size > MAX_SIZE[bucket]) {
      const mb = MAX_SIZE[bucket] / 1024 / 1024
      setError(`Imagem muito grande. Máximo ${mb} MB.`)
      return
    }

    // Preview local imediato
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setLoading(true)

    try {
      const supabase = createClient()

      // Determina extensão e path final
      const ext  = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${storagePath}.${ext}`

      // upsert: sobrescreve se já existir
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) {
        setError('Erro ao enviar imagem. Verifique sua conexão e tente novamente.')
        setPreview(currentUrl)
        return
      }

      // Pega URL pública
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      const publicUrl = data.publicUrl

      setUploaded(true)
      onUploaded(publicUrl)
    } catch {
      setError('Erro inesperado. Tente novamente.')
      setPreview(currentUrl)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  return (
    <div>
      <label className="label-base mb-2 block">{label}</label>

      <div className={`flex ${isSquare ? 'items-start gap-4' : 'flex-col gap-3'}`}>

        {/* Preview */}
        {isSquare ? (
          /* Avatar — quadrado pequeno */
          <div
            className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(8,8,8,0.7)' }}>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--neon)' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              </div>
            )}
          </div>
        ) : (
          /* Cover — landscape */
          preview ? (
            <div
              className="relative w-full h-28 rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview da capa"
                className="w-full h-full object-cover"
                style={{ opacity: loading ? 0.5 : 0.75 }} />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--neon)' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
              )}
              {!loading && uploaded && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(8,8,8,0.8)', color: 'var(--neon)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Salvo
                </div>
              )}
            </div>
          ) : null
        )}

        {/* Drop zone / botão */}
        <div className="flex-1">
          <div
            className="relative rounded-xl border-2 border-dashed transition-colors duration-150 cursor-pointer"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !loading && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={handleChange}
              disabled={loading}
            />
            <div className={`flex flex-col items-center justify-center gap-2 text-center
              ${isSquare ? 'px-4 py-3' : 'px-6 py-5'}`}>
              {loading ? (
                <>
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--neon)' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Enviando…</p>
                </>
              ) : uploaded ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--neon)' }}>
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  <p className="text-xs font-medium" style={{ color: 'var(--neon)' }}>Upload feito!</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Clique para trocar</p>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium" style={{ color: 'var(--neon)' }}>Clique para enviar</span>
                    {' '}ou arraste aqui
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {isSquare ? 'JPEG, PNG ou WebP · máx. 2 MB' : 'JPEG, PNG ou WebP · máx. 5 MB'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Status messages */}
          {error && (
            <p className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: '#F87171' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </p>
          )}
          {hint && !error && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{hint}</p>
          )}
        </div>
      </div>
    </div>
  )
}
