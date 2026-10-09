import {useEffect, useState} from 'react'
import {useAuth} from '../auth'
import {getPTZEntitlement} from '../billing'

export function CheckoutResultPage({status}: {status: 'success' | 'cancelled'}) {
  const {user, loading, getToken} = useAuth()
  const [verifying, setVerifying] = useState(status === 'success')

  useEffect(() => {
    if (status !== 'success' || loading) return
    if (!user) { setVerifying(false); return }
    let active = true
    const verify = async () => {
      for (let attempt = 0; attempt < 4 && active; attempt++) {
        try { if ((await getPTZEntitlement(await getToken())).active) return window.location.replace('/produtos') } catch { /* Stripe webhook may still be processing. */ }
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      if (active) setVerifying(false)
    }
    void verify()
    return () => { active = false }
  }, [getToken, loading, status, user])

  const needsLogin = status === 'success' && !loading && !user

  return <main className="result-page"><section>
    <span>{status === 'success' ? 'PAGAMENTO RECEBIDO' : 'CHECKOUT CANCELADO'}</span>
    <h1>{status === 'success' ? needsLogin ? 'Entre para confirmar seu acesso.' : verifying ? 'Liberando suas ferramentas…' : 'Seu pagamento está em confirmação.' : 'Nenhuma cobrança foi feita.'}</h1>
    <p>{status === 'success' ? needsLogin ? 'Use a mesma conta da compra para concluir a validação da assinatura.' : 'A Stripe está confirmando a assinatura. Assim que concluir, OBS Deck e Controle PTZ serão liberados.' : 'Você pode voltar aos planos quando estiver pronto.'}</p>
    <a href={status === 'success' ? needsLogin ? '/entrar?returnTo=%2Fcheckout%2Fsucesso' : '/produtos' : '/assinar'}>{status === 'success' ? needsLogin ? 'Entrar na minha conta' : 'Ir para meus produtos' : 'Voltar aos planos'}</a>
  </section></main>
}
