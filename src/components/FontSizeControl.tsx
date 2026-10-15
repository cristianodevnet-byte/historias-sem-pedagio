import { useFontScale } from '../hooks/useFontScale'

export function FontSizeControl() {
  const { canDecrease, canIncrease, decrease, increase } = useFontScale()

  return (
    <div className="font-control" role="group" aria-label="Tamanho do texto">
      <button type="button" onClick={decrease} disabled={!canDecrease} aria-label="Diminuir texto">
        <span aria-hidden="true" className="font-control__small">A</span>
      </button>
      <button type="button" onClick={increase} disabled={!canIncrease} aria-label="Aumentar texto">
        <span aria-hidden="true" className="font-control__large">A</span>
      </button>
    </div>
  )
}
