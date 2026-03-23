import axios from "axios"

export const getFriends = async () => {
  const res = await axios.get("http://localhost:3007/api/friends", {
    withCredentials: true,
  })
  return res.data
}