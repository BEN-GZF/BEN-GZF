import React, { useState } from 'react'

// 部署后把这个改成你的后端域名，比如：
// const API_BASE = 'https://salex-api.onrender.com'
const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function App() {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [msg, setMsg] = useState('')

  const onUpload = async () => {
    if (!file) return setMsg('请选择文件')
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (title) fd.append('title', title)
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setMsg(`✅ 上传成功：${data.video.title}（状态：${data.video.status}）`)
    } catch (e) {
      setMsg(`❌ ${e.message}`)
    }
  }

  return (
    <div style={{maxWidth: 600, margin: '40px auto', fontFamily: 'system-ui'}}>
      <h1>SalEx Demo</h1>
      <p>选择视频并上传，后端会写入 Supabase Storage 与数据库。</p>
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <input
        style={{display:'block', marginTop:12, width:'100%'}}
        placeholder="标题（可选）"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <button style={{marginTop:12}} onClick={onUpload}>上传</button>
      <p style={{marginTop:12}}>{msg}</p>
      <hr />
      <small>后端健康检查：<code>/health</code></small>
    </div>
  )
}
