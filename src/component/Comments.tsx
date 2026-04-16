import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { useState } from "react"

export type likes = {
  id: string
  userid: number
  postid: string
}
 
export type feedback = {
 id: string
 body:string
 postid: string
}


export const Comments = ({ postid }: { postid: string }) => {

  const [comment,setComment] =useState("")

  const queryClient = useQueryClient()
  const BASE_URL = "http://localhost:4000/likes"
  const URL = "http://localhost:4000/feedback"

  //  Fetch likes 
  const fetchlikes = async (): Promise<likes[]> => {
    const res = await fetch(`${BASE_URL}?postid=${postid}`)
    if (!res.ok) throw new Error('error fetching data')
    return res.json()
  }

  const { data = [] } = useQuery({
    queryKey: ['likes', postid],
    queryFn: fetchlikes
  })

  //  Adding like
  const { mutate: addLike } = useMutation({
    mutationFn: async (newlike: { userid: number, postid: string }) => {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newlike)
      })

      if (!res.ok) throw new Error('error occurred')
      return res.json()
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', postid] })
    }
  })

  //  Removing like
  const { mutate: removeLike } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('delete failed')
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', postid] })
    }
  })

  //  Checking if user already liked
  const userId = 1
  const alreadyLiked = data.find(like => like.userid === userId)

  const handleLike = () => {
    if (!alreadyLiked) {
      addLike({ userid: userId, postid })
    }
  }

  const handleRemove = () => {
    if (alreadyLiked) {
      removeLike(alreadyLiked.id)
    }
  }

  const fetchfeedback = async (): Promise<feedback[]> => {
    const res = await fetch(`${URL}?postid=${postid}`)
    if (!res.ok) throw new Error('error fetching data')
    return res.json()
  }

  const { data:feedback=[], isLoading,error } = useQuery({
    queryKey: [ 'feedback',postid],
    queryFn: fetchfeedback
  })

  //  Add comment
  const { mutate, isPending } = useMutation({
    mutationFn: async (newComment: { body: string, postid: string }) => {
      const res = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
      })

      if (!res.ok) throw new Error('error occurred')
      return res.json()
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [' feedback',postid] })
      setComment('')
    }
  })


if (isLoading) return <p>Loading...</p>
if (error) return <p className='text-red-500 text-3xl font-bold'>Error fetching data</p>



  return (
    <div className='mt-8 p-6 flex flex-col justify-center gap-2'>

     
      <p className="mb-4 cursor-pointer" onClick={()=>{
        if(alreadyLiked) {
          handleRemove()
        }else {
          handleLike()
        }
      }}>
        {alreadyLiked? "👎 Unlike" : "👍 Like"}: {data.length}
      </p>


      <textarea className="p-0 h-8"
      placeholder="comment" 
       value={comment}
       onChange={(e)=> setComment(e.target.value)}
      />

      <button className="border cursor-pointer p-2"
      onClick={()=> mutate({body:comment,postid})}
      disabled ={isPending}
      >
      {isPending ? 'adding..' : 'send'}</button>

       <div className="flex flex-col gap-4">
        {feedback?.map((c)=>(
          <div key={c.id}>
          <p className="">{c.body}</p>
          </div>
        ))}
        </div>
    </div>
  )
}