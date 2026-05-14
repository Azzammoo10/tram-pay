import Link from 'next/link'
import { MailOpen } from 'lucide-react'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-surface-section flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="card-accent text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-surface-cloud rounded-full flex items-center justify-center">
              <MailOpen size={32} color="#AC6899" />
            </div>
          </div>

          <h1 className="text-[28px] font-bold text-brand-dark leading-tight mb-3">
            Vérifiez votre email
          </h1>

          <p className="text-[14px] text-neutral-muted leading-relaxed mb-8">
            Un lien de confirmation a été envoyé à votre adresse email. Cliquez
            dessus pour activer votre compte.
          </p>

          <Link
            href="/login"
            className="text-[14px] text-cta hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
