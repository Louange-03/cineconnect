import { useEffect, useState } from "react"
import axios from "axios"

export function FriendRequests() {

  const [requests, setRequests] = useState([])
  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await axios.get(
        "http://localhost:3001/api/friends/requests",
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setRequests(res.data)
    }

    fetchRequests()
  }, [token])

  const accept = async (id: string) => {
    await axios.post(
      "http://localhost:3001/api/friends/accept",
      { requestId: id },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    setRequests((prev) => prev.filter((r: any) => r.id !== id))
  }

  const reject = async (id: string) => {
    await axios.post(
      "http://localhost:3001/api/friends/reject",
      { requestId: id },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    setRequests((prev) => prev.filter((r: any) => r.id !== id))
  }

  return (
    <div className="p-6 space-y-4">
      {requests.map((req: any) => (
        <div key={req.id} className="flex items-center gap-4">
          <div>{req.requester_id}</div>

          <button
            onClick={() => accept(req.id)}
            className="bg-green-500 px-3 py-1 rounded text-white"
          >
            Accept
          </button>

          <button
            onClick={() => reject(req.id)}
            className="bg-red-500 px-3 py-1 rounded text-white"
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  )
}