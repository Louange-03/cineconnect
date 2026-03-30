import axios from "axios"
import { buildApiUrl } from "../lib/apiUrl"

export const getFriends = async () => {
  const res = await axios.get(buildApiUrl("/api/friends"), {
    withCredentials: true,
  })
  return res.data
}