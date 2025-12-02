const API_BASE_URL = "http://localhost:5000/api"

export const dashboardAPI = {
  // Récupérer les statistiques globales
  getGlobalStats: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`)
    return res.json()
  },

  // Récupérer tous les modèles
  getAllModels: async () => {
    const res = await fetch(`${API_BASE_URL}/models`)
    return res.json()
  },

  // Récupérer les détails d'un modèle spécifique
  getModelDetails: async (modelId: string | number) => {
    const res = await fetch(`${API_BASE_URL}/models/${modelId}`)
    return res.json()
  },

  // Supprimer un modèle
  deleteModel: async (modelId: string | number) => {
    const res = await fetch(`${API_BASE_URL}/models/${modelId}`, {
      method: "DELETE",
    })
    return res.json()
  },

  // Récupérer les statistiques d'usage API d'un modèle
  getModelApiStats: async (modelId: string | number) => {
    const res = await fetch(`${API_BASE_URL}/models/${modelId}/api-stats`)
    return res.json()
  },

  // Logger un évènement de copie de payload
  logApiCopy: async (modelId: string | number) => {
    return fetch(`${API_BASE_URL}/models/${modelId}/api-stats/copy`, {
      method: "POST",
    })
  },
}
