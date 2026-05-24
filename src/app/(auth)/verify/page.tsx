import Link from 'next/link'
import { MailOpen } from 'lucide-react'
import Logo from '@/components/ui/Logo'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-surface-section flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow matching Rabat-Salé style */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full -mr-64 -mt-64 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cta/5 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] z-10">
        <div className="card-accent bg-white p-8 text-center">
          <div className="flex flex-col items-center mb-6">
            <Logo className="mb-4" showText={true} width={130} height={42} />
            <div className="h-[1px] w-12 bg-neutral-border my-2" />
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#55356D]/5 border border-[#55356D]/15 rounded-full flex items-center justify-center text-[#55356D]">
              <MailOpen size={30} />
            </div>
          </div>

          <h1 className="text-[20px] font-bold text-brand-dark leading-tight mb-3">
            Vérifiez votre email
          </h1>

          <p className="text-[13px] text-neutral-muted leading-relaxed mb-8 max-w-[280px] mx-auto">
            Un lien de confirmation sécurisé a été envoyé à votre adresse e-mail. Veuillez cliquer sur ce lien pour activer votre compte.
          </p>

          <Link
            href="/login"
            className="text-[13px] text-cta hover:underline font-bold"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
