// gọi API backend
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1'
})



export default api