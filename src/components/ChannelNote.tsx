import { siteConfig } from '../config/site'

/** Nota discreta no fim da história. O link do canal só aparece quando estiver configurado. */
export function ChannelNote() {
  const { channel } = siteConfig
  return (
    <p className="channel-note">
      Escrita para quem está de passagem.
      {channel.url && (
        <>
          {' '}Mais no canal{' '}
          <a href={channel.url} target="_blank" rel="noopener noreferrer">
            {channel.name}, no YouTube
          </a>
          .
        </>
      )}
    </p>
  )
}
