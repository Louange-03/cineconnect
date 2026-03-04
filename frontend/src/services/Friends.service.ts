import axios from "axios"

export const getFriends = async () => {
  const res = await axios.get("http://localhost:5000/friends", {
    withCredentials: true,
  })
  return res.data
}