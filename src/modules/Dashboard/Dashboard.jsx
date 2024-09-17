import React,{useState,useEffect,useRef} from 'react'
import Input from '../../components/Input/Input'
import Button from '../../components/Button/Button'
import userLogo from '../../assets/user.svg'
import { io } from "socket.io-client";

function Dashboard() {

      const [user,setUser]=useState(JSON.parse(localStorage.getItem('user:detail')));
      const [conversations,setConversations]=useState([]);
      const [messages,setMessages]=useState({});
      const [message,setMessage]=useState('');
      const [users,setUsers]=useState([]);
      const [socket,setSocket]=useState(null);
      const messageRef=useRef(null);
      const [image,setImage]=useState('');


      useEffect(()=>{
        setSocket(io('http://localhost:8000'));
      },[]);

      useEffect(()=>{
        console.log(socket);
        socket?.emit('addUser',user?.id);
        socket?.on('getUsers',users=>{
          console.log(users);
        });
        socket?.on('getMessage',data=>{
          console.log(data);
          console.log(data.isImage);
          console.log(data.message);
          setMessages(prev=>({
           ...prev,
            messages:[...prev.messages,{user:data.user,message:data.message,isImage:data.isImage}]
          }))
          console.log("messages",messages);
        });
      },[socket])

      const fetchMessages=async (conversationId,receiver)=>{
        // console.log(user);
        const res=await fetch(`http://localhost:3000/api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`);
        // console.log(res);
        if(res.ok){
          const resData=await res.json();
          console.log(78878,resData);
          // console.log(resData);
          setMessages({messages:resData,receiver,conversationId});
        }
      }

      useEffect(()=>{
        const loggedInUser=JSON.parse(localStorage.getItem('user:detail'));
        const fetchConversations=async()=>{
          const res=await fetch(`http://localhost:3000/api/conversation/${loggedInUser.id}`);
          if(res.ok){
            const resdata=await res.json();
            console.log("all convers",resdata);
            console.log("setting the conversations");
            setConversations(resdata);
          }
        }
        fetchConversations();
      },[messages]);
      
      useEffect(()=>{
        const fetchUsers=async ()=>{
          const res=await fetch(`http://localhost:3000/api/users`);
          const resData=await res.json();
          console.log("all users",resData);

          const result = resData.filter(user => {
            // Check if the user exists in the conversations list
            const hasConversation = conversations.some(convers => 
              convers?.user?.receiverId === user?.user?.receiverId
            );
            
            // Only include users who do not have an entry in conversations
            return !hasConversation;
          });
          // console.log("skdnfjks",result);
          setUsers(result);
        };

        fetchUsers();
        //this is to get all users from backend
        
      },[conversations])

      useEffect(()=>{
        messageRef?.current?.scrollIntoView({behaviour:'smooth'});
      },[messages])

      const sendMessage=async()=>{
        
        if(message==='' && image===''){
          alert("Message cannot be empty");
          return;
        }
        if(image!==""){

          const response = await fetch(image);
          const blob = await response.blob();

          // Convert blob to file (provide a filename and MIME type)
          const file = new File([blob], "image.jpg", { type: blob.type });

          // Create a FormData object to send the file
          const formData=new FormData();
          formData.append('conversationId',messages?.conversationId);
          formData.append('senderId',user?.id);
          formData.append('receiverId',messages?.receiver?.receiverId);
          formData.append('file',file);
          console.log(123,formData);
          const res=await fetch(`http://localhost:3000/api/image`,{
            method:"POST",
            body:formData
          });

          const data = await res?.json();
          console.log('Uploaded Image URL:', data.imageUrl);
          

          socket?.emit('sendMessage',{
            conversationId:messages?.conversationId,
            senderId:user?.id,
            message:data.imageUrl,
            receiverId:messages?.receiver?.receiverId,
            isImage:true,
          });
  
          setImage('');
        }

        //use of socket
        // console.log(289734,
        //   user?.id,
        //   messages?.receiver?.receiverId,
        //   message,
        //   messages?.conversationId
        // )
        if(message!==''){
          console.log("senderId",user?.id);
          console.log("receiverId",messages?.receiver?.receiverId);
          const res=await fetch(`http://localhost:3000/api/message`,{
            method:"POST",
            headers:{
              'Content-Type':'application/json'
            },
            body:JSON.stringify({
              conversationId:messages?.conversationId,
              senderId:user?.id,
              message,
              receiverId:messages?.receiver?.receiverId
            })
            
          });
          const data=await res?.json();
          console.log(messages.conversationId);
          // setMessages()
          // setConversations()
        
          if(messages.conversationId==='new'){
            messages.conversationId=data?.conversationId;
          }



          // setConversations(prev=>{
            
          // })

          socket?.emit('sendMessage',{
            conversationId:messages?.conversationId,
            senderId:user?.id,
            message,
            receiverId:messages?.receiver?.receiverId,
            isImage:false,
          });
        }
        

        
        // console.log("message=>",messages?.conversationId,user?.id,message,messages?.receiver?.receiverId);
        // const loggedInUser=JSON.parse(localStorage.getItem('user:detail'));
        setMessage('');
      }

      function handleImageUpload(event){
        console.log(event?.target?.files);
        const file=event?.target?.files;
        if(file){
          console.log("File",file);
          console.log(URL.createObjectURL(file[0]));
          setImage(URL.createObjectURL(file[0]));
        }
      }

      function deleteImage(){
        setImage('');
      }

      console.log(messages?.messages);

      return (
        <>
        <div className="w-screen flex h-screen">
          <div className="w-[25%] min-h-screen bg-blue-300 overflow-scroll">
            <div className="flex items-center my-8 mx-14">
              <div className="border border-primary p-[2px] rounded-full"><img src={userLogo} width={75} height={75}/></div>
              <div className='ml-8'>
                <h3 className='text-2xl'>
                  {user.fullName}
                </h3>
                <p className='text-lg font-light'>My Account</p>
              </div>
            </div>
            <hr></hr>
            <div className='mx-14 mt-10'>
              <div className='text-primary text-lg'>
                Messages
              </div>
              <div>
                {
                  conversations.length>0?
                  conversations.map(({conversationId,user})=>{
                    return(
                      <div className="flex items-center py-8 border-b border-b-gray-300">
                        <div className="cursor-pointer flex items-center" onClick={(event)=>{
                          event.preventDefault();
                          fetchMessages(conversationId,user);
                        }}>
                          <div><img src={userLogo} width={60} height={60}/></div>
                          <div className='ml-6'>
                            <h3 className='text-lg font-semibold'>
                              {user.fullName}
                            </h3>
                            <p className='text-sm font-light'>{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )
                  }):<div className="text-center text-lg font-semibold mt-12">
                    No Conversations Yet!!
                  </div>
                }
              </div>
            </div>
          </div>
          <div className="w-[50%] min-h-screen bg-white flex flex-col items-center">
            {
              messages?.receiver?.fullName &&
                <div className='w-[75%] bg-blue-200 h-[80px] mt-14 rounded-full flex items_center px-14'>
                    <div className='cursor-pointer'>
                        <img src={userLogo} width={60} height={60}/>
                    </div>
                    <div className='ml-6 mr-auto mt-3'>
                        <h3 className='text-lg font-bold'>
                            {messages?.receiver?.fullName}
                        </h3>
                        <p className='text-sm font-light text-gray-600'>{messages?.receiver?.email}</p>
                    </div>
                    <div className='mt-5 cursor-pointer'>
                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-phone"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" /></svg>
                    </div>
                </div>
              
            }
                <div className='h-[75%] border w-full overflow-scroll shadow overflow-y: auto'>
                    <div className=' px-10 py-10 relative'>
                      
                        <div ref={messageRef}>
                          {
                            messages?.messages?.length>0?
                            
                              messages?.messages?.map(({message,user:{id}={},isImage})=>{
                                return(
                                  <div>
                                    <div ref={messageRef}>
                                      {isImage===false?
                                      <div>
                                        <div className={`max-w-[40%]  p-4 mb-6 ${id===user?.id? 'text-white bg-primary rounded-b-xl rounded-tl-xl ml-auto':'bg-secondary rounded-b-xl rounded-tr-xl'}`}>
                                          {message}
                                        </div>
                                      </div>
                                      :
                                      <>
                                        <div className='flex'>
                                          <img src={'http://localhost:3000'+`${message}`} height={30} width={200} className={`mb-6 ${id===user?.id? 'text-white bg-primary rounded-b-xl rounded-tl-xl ml-auto':'bg-secondary rounded-b-xl rounded-tr-xl'}`}
                                          onDoubleClick={(e)=>{
                                             e.preventDefault();
                                             const link=document.createElement('a');
                                             const fileName = message.split('/').pop();
                                             link.href=`http://localhost:3000/download/uploads?filename=${fileName}`;
                                             link.setAttribute('download', fileName);
                                             
                                             document.body.appendChild(link);
                                             link.click();
                                             document.body.removeChild(link);
                                          }}
                                          />
                                          
                                        </div>
                                        
                                      </>
                                      
                                      }
                                    </div>
                                  </div>
                                )
                              })
                            :
                            <div className="text-center text-lg font-semibold mt-12">No Messages Yet!!</div>
                          }
                          
                          <div className='absolute inset-x-0 bottom-0'>
                            {
                              image!=='' && <div className='flex'>
                                <img src={`${image}`} height={30} width={200} className="mb-6 bg-primary rounded-b-xl rounded-tl-xl ml-auto"/>
                                <div className='cursor-pointer' onClick={()=>deleteImage()}>
                                  <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-circle-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-6.489 5.8a1 1 0 0 0 -1.218 1.567l1.292 1.293l-1.292 1.293l-.083 .094a1 1 0 0 0 1.497 1.32l1.293 -1.292l1.293 1.292l.094 .083a1 1 0 0 0 1.32 -1.497l-1.292 -1.293l1.292 -1.293l.083 -.094a1 1 0 0 0 -1.497 -1.32l-1.293 1.292l-1.293 -1.292l-.094 -.083z" /></svg>
                                </div>
                                
                              </div>
                              }
                            </div>
                        </div>
                    </div>
                </div>
                {
                  messages?.receiver?.fullName && 
                  <div className='p-14 w-full flex items-center'>
                      <Input placeholder='Enter Your Message' value={message} onChange={(event)=>{
                        // event.preventDefault();
                        setMessage(event.target.value);
                      }} className={`p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none }`} 
                      isRequired={true}
                      />
                      <div className='ml-4 p-2 cursor-pointer bg-light rounded-full '>
                        <label className="file-label" htmlFor="fileUpload">
                          <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-photo-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01" /><path d="M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5" /><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4" /><path d="M14 14l1 -1c.67 -.644 1.45 -.824 2.182 -.54" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>
                        </label>
                        <input
                          type="file"
                          id="fileUpload"
                          className="file-input"
                          onChange={(event)=>handleImageUpload(event)}
                          class="hidden"
                        />
                      </div>
                      <div className='p-2 cursor-pointer bg-light rounded-full ' onClick={(event)=>{
                        // event.preventDefault();
                        // console.log({user});
                        sendMessage()
                      }}>
                          <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-telegram"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" /></svg>
                      </div>
                  </div>

                }

          </div>
          
          <div className='w-[25%] min-h-screen px-4 py-24 bg-blue-200 overflow-scroll'>
            <div className="text-primary text-lg">
                People
            </div>
              <div>
                {
                  users.length>0?
                  users.map(({user})=>{
                    return(
                      <div className="flex items-center py-8 border-b border-b-gray-300">
                        <div className="cursor-pointer flex items-center" onClick={(event)=>{
                          event.preventDefault();
                          fetchMessages("new",user);
                        }}>
                          <div><img src={userLogo} width={60} height={60}/></div>
                          <div className='ml-6'>
                            <h3 className='text-lg font-semibold'>
                              {user?.fullName}
                            </h3>
                            <p className='text-sm font-light'>{user?.email}</p>
                          </div>
                        </div>
                      </div>
                    )
                  }):<div className="text-center text-lg font-semibold mt-12">
                    No People Yet!!
                  </div>
                }  
              </div>
          </div>
        </div>
        {/* <div className='bg-[#607aa1] flex justify-center items-center h-screen' >
          <Form/>
          
        </div> */}
    
        </>
      )
}

export default Dashboard

