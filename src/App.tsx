import { useState, useEffect } from 'react'
import './App.css'

const STORAGE_KEY = '_sigmoid_click_id'
const AUDIT_URL = 'https://api.mindspa.com/api/v4/sigmoid-audit'
const STRIPE_BASE = 'https://buy.stripe.com/test_6oUbJ20sZflN1AHaK01Jm0q'

function getClickId(): string | null {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('click_id')
  if (fromUrl) {
    localStorage.setItem(STORAGE_KEY, fromUrl)
    return fromUrl
  }
  return localStorage.getItem(STORAGE_KEY)
}

function App() {
  const [clickId, setClickId] = useState<string | null>(null)
  const [auditStatus, setAuditStatus] = useState<string>('')

  useEffect(() => {
    setClickId(getClickId())
  }, [])

  const stripeUrl = clickId
    ? `${STRIPE_BASE}?client_reference_id=${encodeURIComponent(clickId)}`
    : STRIPE_BASE

  async function handleAudit() {
    if (!clickId) {
      setAuditStatus('No click_id to send.')
      return
    }
    setAuditStatus('Sending...')
    try {
      const res = await fetch(AUDIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ click_id: clickId }),
      })
      setAuditStatus(`Audit response: ${res.status} ${res.statusText}`)
    } catch (err) {
      setAuditStatus(`Audit failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <div className="landing">
      <h1>Affiliate Test Landing</h1>

      <section className="info-card">
        <h2>Click ID</h2>
        <code className="click-id-display">{clickId ?? 'None'}</code>
      </section>

      <section className="actions">
        <button className="btn btn-audit" onClick={handleAudit}>
          Simulate Audit Log
        </button>
        {auditStatus && <p className="audit-status">{auditStatus}</p>}

        <a className="btn btn-checkout" href={stripeUrl} target="_blank" rel="noopener noreferrer">
          Proceed to Checkout
        </a>
      </section>

      <footer className="footer">
        <p>Stripe link includes <code>client_reference_id={clickId ?? ''}</code></p>
      </footer>
    </div>
  )
}

export default App
