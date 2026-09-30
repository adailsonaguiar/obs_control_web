import {useEffect, useState} from 'react'
import {useAuth} from '../auth'
import {getPTZEntitlement} from '../billing'

export function CheckoutResultPage({status}: {status: 'success' | 'cancelled'}) {
  const {user, getToken} = useAuth()
  const [verifying, setVerifying] = useState(status === 'success')

  useEffect(() => {
    if (status !== 'success' || !user) return
    let active = true
    const verify = async () => {
      for (let attempt = 0; attempt < 4 && active; attempt++) {
        try { if ((await getPTZEntitlement(await getToken())).active) return window.location.replace('/ptz') } catch { /* Stripe webhook may still be processing. */ }
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      if (active) setVerifying(false)
    }
    void verify()
    return () => { active = false }
  }, [getToken, status, user])

  return <main className="result-page"><section>
    <span>{status === 'success' ? 'PAGAMENTO RECEBIDO' : 'CHECKOUT CANCELADO'}</span>
    <h1>{status === 'success' ? verifying ? 'Ativando seu controle PTZ…' : 'Seu pagamento está em confirmação.' : 'Nenhuma cobrança foi feita.'}</h1>
    <p>{status === 'success' ? 'A Stripe está confirmando a assinatura. Se o acesso não abrir automaticamente, tente novamente em instantes.' : 'Você pode voltar aos planos quando estiver pronto.'}</p>
    <a href={status === 'success' ? '/ptz' : '/assinar'}>{status === 'success' ? 'Verificar acesso' : 'Voltar aos planos'}</a>
  </section></main>
}
