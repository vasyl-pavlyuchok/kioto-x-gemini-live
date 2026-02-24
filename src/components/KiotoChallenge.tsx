'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type Petal = {
  x: number; y: number; size: number
  speedY: number; speedX: number
  angle: number; spin: number
  opacity: number; hue: number; sat: number
  large: boolean; wobble: number
}

type SpeakPhase = 'idle' | 'listen-order' | 'cook-confirm' | 'listen-thanks' | 'cook-farewell'

const GRID_IMAGES = [
  { src: '/images/grid-a.webp', label: '嵐山竹林' },
  { src: '/images/grid-b.webp', label: '五重塔' },
  { src: '/images/grid-c.webp', label: '伏見稲荷' },
]

export default function KiotoChallenge() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [answersOpen, setAnswersOpen] = useState<Set<string>>(new Set())
  const [selectedImg, setSelectedImg] = useState<number | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [audioStatus, setAudioStatus] = useState('▶ \u00a0PULSA PARA ESCUCHAR')

  // ── Speak challenge state ────────────────────────────────────────
  const [speakPhase, setSpeakPhase] = useState<SpeakPhase>('idle')
  const [finalText, setFinalText] = useState('')
  const [interimText, setInterimText] = useState('')
  const recognizerRef = useRef<any>(null)

  // ── Canvas cherry blossom animation ────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0

    function resize() {
      W = canvas!.width = window.innerWidth
      H = canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function makePetal(large = false): Petal {
      if (large) {
        const size = 14 + Math.random() * 18
        return {
          x: Math.random() * W, y: -size, size,
          speedY: 0.35 + Math.random() * 0.45,
          speedX: (Math.random() - 0.5) * 0.3,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.012,
          opacity: 0.55 + Math.random() * 0.35,
          hue: 335 + Math.random() * 15,
          sat: 60 + Math.random() * 20,
          large: true, wobble: Math.random() * 100,
        }
      } else {
        const size = 2.5 + Math.random() * 5
        return {
          x: Math.random() * W, y: -size, size,
          speedY: 0.8 + Math.random() * 1.4,
          speedX: (Math.random() - 0.5) * 0.7,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.06,
          opacity: 0.25 + Math.random() * 0.4,
          hue: 340 + Math.random() * 25,
          sat: 55 + Math.random() * 30,
          large: false, wobble: Math.random() * 100,
        }
      }
    }

    const petals: Petal[] = []
    for (let i = 0; i < 8; i++) { const p = makePetal(true); p.y = Math.random() * window.innerHeight; petals.push(p) }
    for (let i = 0; i < 45; i++) { const p = makePetal(false); p.y = Math.random() * window.innerHeight; petals.push(p) }

    function drawPetal(p: Petal) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.globalAlpha = p.opacity
      if (p.large) {
        const s = p.size
        ctx.beginPath()
        ctx.moveTo(0, -s)
        ctx.bezierCurveTo(s * 0.6, -s * 0.6, s * 0.7, s * 0.4, 0, s * 0.9)
        ctx.bezierCurveTo(-s * 0.7, s * 0.4, -s * 0.6, -s * 0.6, 0, -s)
        const grad = ctx.createRadialGradient(0, -s * 0.2, 0, 0, 0, s)
        grad.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, 92%, 1)`)
        grad.addColorStop(1, `hsla(${p.hue - 5}, ${p.sat - 10}%, 75%, 0.6)`)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(0, -s * 0.9)
        ctx.lineTo(0, s * 0.7)
        ctx.strokeStyle = `hsla(${p.hue - 10}, 40%, 70%, 0.25)`
        ctx.lineWidth = 0.5
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size * 0.45, p.size, 0, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, 88%, 1)`
        ctx.fill()
      }
      ctx.restore()
    }

    let animId: number
    function animate() {
      ctx.clearRect(0, 0, W, H)
      petals.forEach((p, i) => {
        p.y += p.speedY
        p.x += p.speedX + Math.sin((p.y + p.wobble) * (p.large ? 0.008 : 0.018)) * (p.large ? 0.6 : 0.9)
        p.angle += p.spin
        if (p.y > H + p.size * 2) petals[i] = makePetal(p.large)
        drawPetal(p)
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  // ── Interactividad ──────────────────────────────────────────────
  function toggleAnswer(id: string) {
    setAnswersOpen(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectImage(idx: number) {
    setSelectedImg(prev => prev === idx ? null : idx)
  }

  function playAnnouncement() {
    if (speaking) return
    if (!window.speechSynthesis) {
      setAudioStatus('NAVEGADOR NO COMPATIBLE CON AUDIO')
      return
    }
    const text = 'まもなく、のぞみ二十七号、新大阪行きが、五番線に参ります。危ないですので、黄色い線の内側にお下がりください。'
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ja-JP'
    utter.rate = 0.85
    utter.pitch = 1.05
    setSpeaking(true)
    setAudioStatus('◼ \u00a0REPRODUCIENDO ANUNCIO...')
    utter.onend = () => {
      setSpeaking(false)
      setAudioStatus('▶ \u00a0PULSA PARA ESCUCHAR')
    }
    speechSynthesis.speak(utter)
  }

  // ── Speak challenge logic ───────────────────────────────────────
  function startSpeakPhase(type: 'order' | 'thanks') {
    setFinalText('')
    setInterimText('')
    setSpeakPhase(type === 'order' ? 'listen-order' : 'listen-thanks')

    if (recognizerRef.current) {
      try { recognizerRef.current.abort() } catch (_) {}
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      // Fallback for unsupported browsers — simulate after 2 s
      setTimeout(() => {
        setSpeakPhase(type === 'order' ? 'cook-confirm' : 'cook-farewell')
      }, 2000)
      return
    }

    const rec = new SR()
    rec.lang = 'ja-JP'
    rec.interimResults = true
    rec.continuous = false
    rec.maxAlternatives = 1
    recognizerRef.current = rec

    rec.onresult = (e: any) => {
      let ft = ''
      let it = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) ft += e.results[i][0].transcript
        else it += e.results[i][0].transcript
      }
      setFinalText(ft)
      setInterimText(it)
    }

    const advance = () => {
      setInterimText('')
      setSpeakPhase(type === 'order' ? 'cook-confirm' : 'cook-farewell')
    }
    rec.onend = advance
    rec.onerror = advance

    rec.start()
  }

  function resetSpeak() {
    if (recognizerRef.current) {
      try { recognizerRef.current.abort() } catch (_) {}
    }
    setSpeakPhase('idle')
    setFinalText('')
    setInterimText('')
  }

  const isListening = speakPhase === 'listen-order' || speakPhase === 'listen-thanks'

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="kioto-page">
      <canvas ref={canvasRef} id="petal-canvas" />

      <div className="page-wrap">

        {/* ── Header ── */}
        <header className="site-header">
          <span className="day-badge">RetoIA · Día 04</span>
          <h1>
            Kioto × Gemini Live
            <span className="jp">京都 × ジェミニ ライブ</span>
          </h1>
          <p className="hero-sub-label">4 retos en vivo &nbsp;·&nbsp; Lee, habla, escucha e identifica</p>
          <div className="hero-torii">
            <span className="torii-line" />
            <span className="torii-icon">⛩</span>
            <span className="torii-line" />
          </div>
          <nav className="challenge-nav">
            <button onClick={() => document.getElementById('c1')?.scrollIntoView({ behavior: 'smooth' })}>01 · Leer</button>
            <span className="nav-dash">—</span>
            <button onClick={() => document.getElementById('c2')?.scrollIntoView({ behavior: 'smooth' })}>02 · Hablar</button>
            <span className="nav-dash">—</span>
            <button onClick={() => document.getElementById('c3')?.scrollIntoView({ behavior: 'smooth' })}>03 · Escuchar</button>
            <span className="nav-dash">—</span>
            <button onClick={() => document.getElementById('c4')?.scrollIntoView({ behavior: 'smooth' })}>04 · Ver</button>
          </nav>
        </header>

        {/* ── Challenge 01: Menú ── */}
        <section id="c1" className="challenge">
          <span className="kanji-bg" aria-hidden="true">食</span>
          <div className="challenge-header">
            <span className="reto-label">— Reto 01</span>
            <span className="reto-action">👁 Leer · Traducir</span>
          </div>
          <div className="challenge-body">
            <p className="challenge-statement">Te sientas en un restaurante.<br />El menú está completamente en japonés.</p>
            <p className="instruction">Apunta la cámara. Pregúntale a Gemini Live: &ldquo;¿Qué dice esto y qué me recomiendas pedir?&rdquo;</p>
            <div className="menu-card">
              <div className="menu-title">本日のお献立</div>
              <div className="menu-item">
                <span className="jp-name">湯豆腐</span>
                <span className="jp-sub">冬の京都の定番料理</span>
                <span className="price">¥ 1,200</span>
              </div>
              <div className="menu-item">
                <span className="jp-name">鱧の天ぷら</span>
                <span className="jp-sub">夏限定・揚げたて</span>
                <span className="price">¥ 2,400</span>
              </div>
              <div className="menu-item">
                <span className="jp-name">抹茶プリン</span>
                <span className="jp-sub">宇治抹茶使用・手作り</span>
                <span className="price">¥ 680</span>
              </div>
              <div className="menu-item">
                <span className="jp-name">京野菜の炊き合わせ</span>
                <span className="jp-sub">季節の野菜を丁寧に煮込んだ</span>
                <span className="price">¥ 1,800</span>
              </div>
            </div>
            <button className="reveal-btn" onClick={() => toggleAnswer('ans1')}>
              {answersOpen.has('ans1') ? '▲ Ocultar respuesta' : '▶ Revelar después de que Gemini responda'}
            </button>
            <div className={`answer-box${answersOpen.has('ans1') ? ' visible' : ''}`}>
              <strong>湯豆腐</strong> (yu-dōfu) — Tofu caliente en caldo dashi, plato icónico de la cocina kaiseki de Kioto.<br /><br />
              <strong>鱧の天ぷら</strong> (hamo no tempura) — Anguila de mar rebozada, especialidad del verano en Kioto.<br /><br />
              <strong>抹茶プリン</strong> (matcha purin) — Flan cremoso de té verde matcha, un postre moderno muy popular.<br /><br />
              <strong>京野菜の炊き合わせ</strong> (kyōyasai no takiawase) — Verduras de Kioto cocinadas lentamente en caldo, plato de temporada.
            </div>
          </div>
        </section>

        {/* ── Section divider ── */}
        <div className="section-sep" aria-hidden="true">
          <span className="sep-line" /><span className="sep-kanji">声</span><span className="sep-line" />
        </div>

        {/* ── Challenge 02: Pedir comida ── */}
        <section id="c2" className="challenge">
          <span className="kanji-bg" aria-hidden="true">言</span>
          <div className="challenge-header">
            <span className="reto-label">— Reto 02</span>
            <span className="reto-action">🎙 Hablar · Pedir</span>
          </div>
          <div className="challenge-body">
            <p className="challenge-statement">Llegas al mostrador.<br />Dos cocineros esperan tu pedido en japonés.</p>
            <p className="instruction">Activa Gemini Live para que te ayude a pronunciar. Cuando estés listo, pulsa el botón y habla.</p>

            {/* Restaurant image */}
            <div className="restaurant-card">
              <div className="restaurant-img-wrap">
                <Image
                  src="/images/Gemini_Section_new.png"
                  alt=""
                  fill
                  sizes="(max-width: 860px) 100vw, 860px"
                />
              </div>
              <div className="restaurant-overlay" />
              <div className="cook-bubble">
                <span className="cook-greeting">いらっしゃいませ！</span>
                <span className="cook-question">ご注文はお決まりですか？</span>
              </div>
            </div>

            {/* Cheat sheet */}
            <div className="cheat-sheet">
              <div className="cheat-title">チートシート — Lo que debes decir</div>
              <div className="cheat-row">
                <span className="cheat-tag"><span className="cheat-tag-num">01</span>· Pedido</span>
                <span className="cheat-jp">すみません、湯豆腐をひとつと、抹茶プリンをひとつお願いします。</span>
                <span className="cheat-romaji">Sumimasen, yudōfu wo hitotsu to, matcha purin wo hitotsu onegaishimasu.</span>
              </div>
              <div className="cheat-row">
                <span className="cheat-tag"><span className="cheat-tag-num">02</span>· Gracias</span>
                <span className="cheat-jp">ありがとうございます。</span>
                <span className="cheat-romaji">Arigatō gozaimasu.</span>
              </div>
            </div>

            {/* Recognition stage */}
            <div className={`speak-stage${speakPhase !== 'idle' ? ' active' : ''}`}>
              {speakPhase === 'idle' && (
                <span className="speak-idle-hint">— Pulsa el botón cuando estés listo —</span>
              )}
              {isListening && (
                <div className="speak-text-wrap">
                  <span className="speak-mic-dot" />
                  <p className="speak-live-text">
                    {finalText.split('').map((ch, i) => (
                      <span key={`f${i}`} className="rec-char final">{ch}</span>
                    ))}
                    {interimText.split('').map((ch, i) => (
                      <span
                        key={`it${i}`}
                        className="rec-char interim"
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >{ch}</span>
                    ))}
                    {!finalText && !interimText && (
                      <span className="rec-cursor">▌</span>
                    )}
                  </p>
                </div>
              )}
              {speakPhase === 'cook-confirm' && (
                <div className="cook-response">
                  <span className="cook-resp-jp">かしこまりました。少々お待ちください。</span>
                  <span className="cook-resp-es">Entendido — en seguida se lo preparamos.</span>
                </div>
              )}
              {speakPhase === 'cook-farewell' && (
                <div className="cook-response">
                  <span className="cook-resp-jp">ありがとうございました。またのお越しをお待ちしております。</span>
                  <span className="cook-resp-es">¡Gracias! Le esperamos de nuevo pronto.</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="speak-actions">
              {speakPhase === 'idle' && (
                <button className="speak-btn" onClick={() => startSpeakPhase('order')}>
                  🎙 &nbsp;Hacer el pedido
                </button>
              )}
              {speakPhase === 'cook-confirm' && (
                <button className="speak-btn" onClick={() => startSpeakPhase('thanks')}>
                  🎙 &nbsp;Dar las gracias
                </button>
              )}
              {speakPhase === 'cook-farewell' && (
                <button className="speak-btn speak-btn--reset" onClick={resetSpeak}>
                  ↩ &nbsp;Intentar de nuevo
                </button>
              )}
            </div>

            <button className="reveal-btn" onClick={() => toggleAnswer('ans-speak')}>
              {answersOpen.has('ans-speak') ? '▲ Ocultar respuesta' : '▶ Revelar después de que Gemini responda'}
            </button>
            <div className={`answer-box${answersOpen.has('ans-speak') ? ' visible' : ''}`}>
              <strong>すみません、湯豆腐をひとつと、抹茶プリンをひとつお願いします。</strong><br />
              すみません (sumimasen) = disculpe &nbsp;·&nbsp; ひとつ (hitotsu) = uno &nbsp;·&nbsp; と (to) = y &nbsp;·&nbsp; お願いします (onegaishimasu) = por favor<br /><br />
              <strong>ありがとうございます。</strong><br />
              La forma formal de "gracias". En contexto de restaurante siempre se usa ございます, nunca solo ありがとう.
            </div>
          </div>
        </section>

        {/* ── Section divider ── */}
        <div className="section-sep" aria-hidden="true">
          <span className="sep-line" /><span className="sep-kanji">春</span><span className="sep-line" />
        </div>

        {/* ── Challenge 03: Anuncio de tren ── */}
        <section id="c3" className="challenge">
          <span className="kanji-bg" aria-hidden="true">旅</span>
          <div className="challenge-header">
            <span className="reto-label">— Reto 03</span>
            <span className="reto-action">🔊 Escuchar · Entender</span>
          </div>
          <div className="challenge-body">
            <p className="challenge-statement">Estás en la estación de Kioto.<br />Suena un anuncio que no entiendes.</p>
            <p className="instruction">Reproduce el anuncio con Gemini Live activo. Pídele que te explique qué escucha.</p>
            <div className="station-card" onClick={playAnnouncement}>
              <div className="station-img-wrap">
                <Image
                  src="/images/station2.webp"
                  alt="Estación de tren japonesa"
                  fill
                  sizes="(max-width: 860px) 100vw, 860px"
                  priority
                />
              </div>
              <div className="station-overlay" />
              <div className="station-hud">
                <div className="station-badge">
                  <span className={`station-dot${speaking ? ' playing' : ''}`} />
                  JR KYOTO LINE
                </div>
                <div className="station-announcement">
                  <div className="ann-label">アナウンス中</div>
                  <div className="ann-jp">
                    まもなく、のぞみ二十七号<br />
                    新大阪行き — 五番線
                  </div>
                </div>
              </div>
              <div className="station-play-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
              <div className="station-status">{audioStatus}</div>
            </div>
            <button className="reveal-btn" onClick={() => toggleAnswer('ans3')}>
              {answersOpen.has('ans3') ? '▲ Ocultar respuesta' : '▶ Revelar después de que Gemini responda'}
            </button>
            <div className={`answer-box${answersOpen.has('ans3') ? ' visible' : ''}`}>
              <span className="jp-answer">まもなく、のぞみ二十七号、新大阪行きが、五番線に参ります。</span>
              <strong>Traducción:</strong> &ldquo;En breve, el Nozomi número 27 con destino Shin-Osaka llegará al andén número cinco. Por favor, retírense de la línea amarilla.&rdquo;<br /><br />
              🚄 <strong>Tren:</strong> Nozomi 27 &nbsp;|&nbsp; 🏁 <strong>Destino:</strong> Shin-Osaka &nbsp;|&nbsp; 🚉 <strong>Andén:</strong> 5
            </div>
          </div>
        </section>

        {/* ── Section divider ── */}
        <div className="section-sep" aria-hidden="true">
          <span className="sep-line" /><span className="sep-kanji">花</span><span className="sep-line" />
        </div>

        {/* ── Challenge 04: Identificar imágenes ── */}
        <section id="c4" className="challenge">
          <span className="kanji-bg" aria-hidden="true">景</span>
          <div className="challenge-header">
            <span className="reto-label">— Reto 04</span>
            <span className="reto-action">🖼 Ver · Identificar</span>
          </div>
          <div className="challenge-body">
            <p className="challenge-statement">Tres estampas.<br />Tres lugares míticos de Kioto.</p>
            <p className="instruction">Muéstrale cada imagen a Gemini Live y pregúntale dónde es. Pulsa para revelar color y nombre.</p>
            <div className="image-grid">
              {GRID_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  className={`img-option${selectedImg === idx ? ' selected' : ''}`}
                  onClick={() => selectImage(idx)}
                >
                  <Image
                    src={img.src}
                    alt={img.label}
                    fill
                    sizes="(max-width: 600px) 100vw, 280px"
                  />
                  <div className="img-label">{img.label}</div>
                </div>
              ))}
            </div>
            <button className="reveal-btn" onClick={() => toggleAnswer('ans4')}>
              {answersOpen.has('ans4') ? '▲ Ocultar respuesta' : '▶ Revelar después de que Gemini responda'}
            </button>
            <div className={`answer-box${answersOpen.has('ans4') ? ' visible' : ''}`}>
              <strong>嵐山竹林の道</strong> (Arashiyama Bamboo Grove) — El famoso camino entre cañas de bambú gigantes en Arashiyama, al oeste de Kioto. Sus sonidos fueron declarados patrimonio sonoro de Japón.<br /><br />
              <strong>五重塔</strong> (Gojū-no-tō) — Pagoda de cinco pisos, símbolo de la arquitectura budista japonesa. Esta estampa representa la pagoda de Tō-ji, el templo más alto de madera de Japón.<br /><br />
              <strong>伏見稲荷大社</strong> (Fushimi Inari Taisha) — El santuario shinto dedicado a Inari, dios del arroz. Sus miles de torii rojas en fila forman uno de los paisajes más fotográficos de Japón.
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="site-footer">
          RetoIA · Día 04 &nbsp;·&nbsp; <span>京都</span> &nbsp;·&nbsp; Gemini Live Challenge
          <div className="signature">
            <div className="sig-line" />
            <span className="sig-label">Concebido &amp; diseñado por</span>
            <span className="sig-name">Vasyl Pavlyuchok</span>
          </div>
        </footer>

      </div>
    </div>
  )
}
