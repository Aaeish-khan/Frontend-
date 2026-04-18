import { useEffect, useRef, useState } from "react"

export function useAudioLevel(stream: MediaStream | null): number {
  const [level, setLevel] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!stream) {
      setLevel(0)
      return
    }

    let ctx: AudioContext
    try {
      ctx = new AudioContext()
    } catch {
      return
    }

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    const source = ctx.createMediaStreamSource(stream)
    source.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length
      setLevel(Math.round((avg / 255) * 100))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      source.disconnect()
      ctx.close().catch(() => {})
    }
  }, [stream])

  return level
}
