/** Ornamento discreto: a faixa tracejada de uma estrada, terminando num ponto. */
export function RoadLine({ ending = false }: { ending?: boolean }) {
  return (
    <div className={ending ? 'road-line road-line--ending' : 'road-line'} aria-hidden="true">
      <span />
      <span />
      <span />
      {ending && <i />}
    </div>
  )
}
