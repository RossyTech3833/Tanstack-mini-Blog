import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Comments } from './Comments'


 export type posts = {
  id: string
  title: string
  body: string
}

function Home() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  

  const queryClient = useQueryClient()

const BASE_URL = "http://localhost:4000/posts"

  const fetchpost = async (): Promise<posts[]> => {
    const res = await fetch(BASE_URL)
    if (!res.ok) throw new Error('error fetching data')
    return res.json()
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchpost
  })



  const { mutate, isPending } = useMutation({
    mutationFn: async (newPost: { title: string,body: string }) => {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          title: newPost.title,
          body: newPost.body,
        })
      })

      if (!res.ok) throw new Error('error occurred')
      return res.json()
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['posts']
      
      })
      setTitle('')
      setBody('')
    }
  })

  // deleting a post
  const { mutate: deletePost } = useMutation({

    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE'
      })
  
      if (!res.ok) throw new Error('delete failed')
      return id
    },
  
    onSuccess:()=>{
      queryClient.invalidateQueries({
        queryKey: ['posts']
      })
    }
    
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className='text-red-500 text-3xl font-bold'>Error fetching data</p>




  return (
    <div className='gap-6 p-6 m-4'>

<h1 className='capitalize text-2xl sm:text-4xl md:text-5xl 
  m-4 sm:m-8 flex justify-center bg-black p-4 sm:p-6 w-full
  font-bold text-white text-center'> a mini blog post demo</h1>

      <div className='flex flex-col sm:flex-row md:flex-row items-center justify-center 
  gap-4 md:gap-6 m-4 sm:m-6 w-full bg-black p-4'>
 
      <input
      type='text'
      className='border outline bg-white p-3'
      value={title}
      placeholder='Title'
      onChange={(e) => setTitle(e.target.value)}
    />

        <textarea
        className='border outline bg-white '
        value={body}
        placeholder='enter your text here'
        onChange={(e) => setBody(e.target.value)}
      />

        <button
          className='border cursor-pointer outline bg-white p-3 gap-4 md:gap-2 m-2 sm:m-2 '
          onClick={() => mutate({ title ,body})}
          disabled={isPending}
        >
          {isPending ? 'Adding...' : 'Add new post'}
        </button>
      </div>

      <ul className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
      gap-8 max-w-10xl w-full h-2 '>
       {Array.isArray (data)&& data?.map((post)=> (
        <div key={post.id} className='flex align-center justify-center  p-6'>
              {/* <h1>ID :{post.id}</h1> */}
              <div className=' border-b shadow-lg shadow-blue-600/50 
             transition-all duration-300 ease-in-out hover:scale-105 '>
              <div className=''>
              <h2 className='font-bold uppercase text-black flex justify-center p-4 m-4' >{post.title}</h2>
              <p className='font-bold capitalize text-black flex justify-center p-4 m-4'>{post.body}</p>
              </div>
              <Comments postid={post.id} />
              
             <button  onClick={() => deletePost(post.id)}
             className='flex text-end text-red-400 uppercase font-bold cursor-pointer '>delete post</button>
              </div>
            </div>
       ))}
      </ul>
    </div>
  )
}

export default Home