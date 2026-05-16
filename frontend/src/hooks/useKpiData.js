import { useState, useEffect, useCallback } from 'react'
import { kpiApi } from '../api/client'

export default function useKpiData(historyDays = 30) {
  const [summary, setSummary]         = useState(null)
  const [history, setHistory]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [error,   setError]           = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [sumRes, histRes] = await Promise.all([
        kpiApi.summary(),
        kpiApi.history(historyDays),
      ])
      setSummary(sumRes.data)
      setHistory(histRes.data.series || [])
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load KPI data')
    } finally {
      setLoading(false)
    }
  }, [historyDays])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { summary, history, loading, error, refresh: fetchAll, lastUpdated }
}
