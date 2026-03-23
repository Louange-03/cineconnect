import axios from "axios"

export const getMessages = async (friendId: number) => {
  const res = await axios.get(
    `http://localhost:3007/api/messages/${friendId}`,
    { withCredentials: true }
  )
  return res.data
}