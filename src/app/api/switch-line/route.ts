import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    // 1. Authenticate passenger
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const admin = createAdminClient()

    // 2. Fetch the passenger's active ticket (PENDING or USED and not expired by time)
    const { data: ticket, error: fetchError } = await admin
      .from('tickets')
      .select('id, current_line, line_switched, expires_at')
      .eq('user_id', user.id)
      .in('status', ['PENDING', 'USED'])
      .gt('expires_at', new Date().toISOString())
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !ticket) {
      return Response.json({ error: 'Aucun titre de transport actif trouvé pour ce changement.' }, { status: 404 })
    }

    // 3. Strict rule check: only 1 line transfer switch allowed per ticket
    if (ticket.line_switched) {
      return Response.json({ error: 'Correspondance déjà utilisée ! Vous ne pouvez changer de ligne qu\'une seule fois par trajet.' }, { status: 400 })
    }

    // 4. Toggle line between L1 and L2
    const nextLine = ticket.current_line === 'L2' ? 'L1' : 'L2'

    // 5. Update database securely
    const { error: updateError } = await admin
      .from('tickets')
      .update({
        current_line: nextLine,
        line_switched: true
      })
      .eq('id', ticket.id)

    if (updateError) {
      console.error('Failed to update line switch:', updateError)
      return Response.json({ error: 'Impossible de changer de ligne. Erreur base de données.' }, { status: 500 })
    }

    return Response.json({
      success: true,
      current_line: nextLine,
      line_switched: true
    })
  } catch (err: any) {
    console.error('Switch-line API error:', err)
    return Response.json({ error: 'Erreur interne du serveur: ' + err.message }, { status: 500 })
  }
}
