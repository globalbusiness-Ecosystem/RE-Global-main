'use client'
import { useEffect, useState } from 'react'

const RAW_URL = 'https://raw.githubusercontent.com/globalbusiness-Ecosystem/SmartContracts/main/contracts/subscription/src/re_platform.rs'

export default function ContractPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(RAW_URL)
      .then(r => r.text())
      .then(text => { setCode(text); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main style={{ background: '#0d0d0d', minHeight: '100vh', padding: '2rem', color: '#fff' }}>
      <h1 style={{ color: '#C9A84C' }}>📜 Smart Contract — RE Platform</h1>
      <p style={{ color: '#aaa' }}>Pi Testnet · Rust · AdvancedRentalContract</p>
      {loading ? <p>جاري التحميل...</p> : (
        <pre style={{
          background: '#1a1a1a', padding: '1.5rem',
          borderRadius: '8px', overflow: 'auto',
          fontSize: '13px', border: '1px solid #C9A84C33'
        }}>
          <code>{code}</code>
        </pre>
      )}
    </main>
  )
}
