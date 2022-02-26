import { useEffect, useState } from 'react'
import CastSession from './CastSession'
import SessionManager from './SessionManager'

export interface UseCastSessionOptions {
  /**
   * Skip updating the session when the app is suspended to background or resumed back.
   */
  ignoreSessionUpdatesInBackground?: boolean
}

/**
 * Hook that provides the current {@link CastSession}.
 *
 * @returns current session, or `null` if there's no session connected
 * @example
 * ```js
 * import { useCastSession } from 'react-native-google-cast'
 *
 * function MyComponent() {
 *   const castSession = useCastSession()
 *
 *   if (castSession) {
 *     castSession.client.loadMedia(...)
 *   }
 * }
 * ```
 */

export default function useCastSession(
  options?: UseCastSessionOptions
): CastSession | null {
  const ignoreBackground = options?.ignoreSessionUpdatesInBackground

  const [castSession, setCastSession] = useState<CastSession | null>(null)

  useEffect(() => {
    manager.getCurrentCastSession().then(setCastSession)

    const started = manager.onSessionStarted(setCastSession)

    const suspended = ignoreBackground
      ? null
      : manager.onSessionSuspended(() => setCastSession(null))

    const resumed = manager.onSessionResumed((session) => {
      if (ignoreBackground) {
        // only update the session if it's different from previous one
        setCastSession((s) => (s?.id === session.id ? s : session))
      } else {
        setCastSession(session)
      }
    })

    const ended = manager.onSessionEnded(() => setCastSession(null))

    return () => {
      started.remove()
      suspended?.remove()
      resumed?.remove()
      ended.remove()
    }
  }, [ignoreBackground])

  return castSession
}

const manager = new SessionManager()
