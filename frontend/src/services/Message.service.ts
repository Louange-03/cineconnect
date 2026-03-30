import axios from "axios"
import { buildApiUrl } from "../lib/apiUrl"

export const getMessages = async (friendId: number) => {
  const res = await axios.get(buildApiUrl(`/api/messages/${friendId}`),
    { withCredentials: true }
  )
  return res.data
}