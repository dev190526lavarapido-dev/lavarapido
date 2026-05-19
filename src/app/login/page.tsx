'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Store } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { login } from '@/server/actions/auth'

const schema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function onSubmit(data: FormData) {
    setServerError(null)
    startTransition(async () => {
      const result = await login(data)
      if (result?.error) {
        setServerError(result.error)
      }
    })
  }

  return (
    <div
      className="grid min-h-dvh place-items-center p-6"
      style={{
        background:
          'radial-gradient(1200px 600px at 0% 0%, color-mix(in oklab, var(--yellow) 25%, transparent), transparent 60%), radial-gradient(900px 500px at 100% 100%, color-mix(in oklab, var(--brand) 20%, transparent), transparent 60%), var(--bg)',
      }}
    >
      <div className="w-full" style={{ maxWidth: 380 }}>
        {/* Header */}
        <div className="mb-[22px] text-center">
          <div
            className="mx-auto mb-3.5 grid h-[76px] w-[76px] place-items-center rounded-[22px] bg-brand font-heading text-[36px] font-extrabold text-brand-ink"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            LR
          </div>
          <h1 className="mb-1 font-heading text-[28px] font-bold tracking-tight text-ink">
            Bom te ver de volta!
          </h1>
          <p className="text-[14px]" style={{ color: 'var(--muted-color)' }}>
            Entra ai pra cuidar da galera de hoje.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3.5 rounded-[var(--radius-card)] bg-surface"
          style={{
            padding: 22,
            boxShadow: 'var(--shadow)',
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink">Email</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="h-10 rounded-[var(--radius-btn)] border border-line bg-[var(--bg)] px-3 text-[14px] text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="seu@email.com"
            />
            {errors.email && (
              <span className="text-[12px] text-rose">{errors.email.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink">Senha</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className="h-10 rounded-[var(--radius-btn)] border border-line bg-[var(--bg)] px-3 text-[14px] text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-[12px] text-rose">{errors.password.message}</span>
            )}
          </div>

          {serverError && (
            <div className="rounded-[var(--radius-btn)] bg-rose/10 px-3 py-2 text-center text-[13px] font-medium text-rose">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-brand font-heading text-[15px] font-bold text-brand-ink shadow-sm transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? 'Entrando...' : 'Entrar no painel'}
            {!isPending && <ArrowRight size={18} />}
          </button>

          <p className="text-center text-[12px]" style={{ color: 'var(--muted-color)' }}>
            Esquecer senha? Fala com o suporte.
          </p>
        </form>

        {/* Link vitrine */}
        <div className="mt-[18px] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] px-3 py-1.5 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-[var(--bg-2)] hover:text-ink"
          >
            <Store size={16} />
            Ver vitrine publica
          </Link>
        </div>
      </div>
    </div>
  )
}
