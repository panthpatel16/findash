import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/ws'

/**
 * useWebSocket — subscribes to a STOMP topic and returns the latest message.
 *
 * @param {string}   topic      - STOMP destination, e.g. '/topic/kpi'
 * @param {boolean}  enabled    - pause subscription without unmounting
 * @returns {{ data, connected, error }}
 */
export default function useWebSocket(topic, enabled = true) {
  const [data,      setData]      = useState(null)
  const [connected, setConnected] = useState(false)
  const [error,     setError]     = useState(null)
  const clientRef = useRef(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('fd_token')

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        setError(null)
        stompClient.subscribe(topic, (msg) => {
          try {
            setData(JSON.parse(msg.body))
          } catch {
            setData(msg.body)
          }
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError:  (frame) => setError(frame.headers?.message || 'STOMP error'),
      onWebSocketError: ()   => setError('WebSocket connection failed'),
    })

    stompClient.activate()
    clientRef.current = stompClient
  }, [topic])

  useEffect(() => {
    if (!enabled) return
    connect()
    return () => {
      clientRef.current?.deactivate()
    }
  }, [connect, enabled])

  return { data, connected, error }
}
