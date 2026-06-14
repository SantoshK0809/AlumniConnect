// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { 
//   XMarkIcon,
//   MagnifyingGlassIcon,
//   PaperAirplaneIcon,
//   UserCircleIcon
// } from "@heroicons/react/24/outline";

// const CreateMessage = ({ onSubmit }) => {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [text, setText] = useState("");

//   useEffect(() => {
//     if (!open) {
//       setSearch("");
//       setSelectedUser(null);
//       setText("");
//       setUsers([]);
//       return;
//     }

//     const fetchUsers = async () => {
//       if (!search.trim()) {
//         setUsers([]);
//         return;
//       }
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         const res = await axios.get(`http://localhost:4000/api/directory?search=${search}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setUsers(res.data.users || []);
//       } catch (err) {
//         console.error("Error fetching directory for messages:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const timer = setTimeout(fetchUsers, 400);
//     return () => clearTimeout(timer);
//   }, [search, open]);

//   const submit = () => {
//     if (!selectedUser || !text.trim()) return;
//     onSubmit({ to: selectedUser.id || selectedUser._id, text });
//     setOpen(false);
//   };

//   return (
//     <>
//       <button
//         onClick={() => setOpen(true)}
//         className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95"
//       >
//         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//         </svg>
//         New Message
//       </button>

//       {open && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          
//           <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
//             {/* Header */}
//             <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
//               <h2 className="text-xl font-black text-slate-900">New Message</h2>
//               <button 
//                 onClick={() => setOpen(false)}
//                 className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
//               >
//                 <XMarkIcon className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="p-6 flex flex-col gap-6">
//               {/* Recipient Selection */}
//               {!selectedUser ? (
//                 <div>
//                   <label className="block text-sm font-bold text-slate-700 mb-2">To:</label>
//                   <div className="relative">
//                     <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                     <input
//                       autoFocus
//                       placeholder="Search by name..."
//                       value={search}
//                       onChange={(e) => setSearch(e.target.value)}
//                       className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
//                     />
//                   </div>

//                   {/* Search Results */}
//                   {search.trim() && (
//                     <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50">
//                       {loading ? (
//                         <div className="p-4 text-center text-sm font-bold text-slate-400">Searching...</div>
//                       ) : users.length === 0 ? (
//                         <div className="p-4 text-center text-sm font-bold text-slate-400">No users found.</div>
//                       ) : (
//                         users.map((u) => (
//                           <div 
//                             key={u._id || u.id}
//                             onClick={() => setSelectedUser(u)}
//                             className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
//                           >
//                             <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
//                               {u.name.charAt(0)}
//                             </div>
//                             <div>
//                               <p className="text-sm font-bold text-slate-900">{u.name}</p>
//                               <p className="text-xs font-semibold text-slate-500">{u.role}</p>
//                             </div>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
//                       {selectedUser.name.charAt(0)}
//                     </div>
//                     <div>
//                       <p className="text-sm font-bold text-indigo-900">To: {selectedUser.name}</p>
//                       <p className="text-xs font-semibold text-indigo-600/80">{selectedUser.role}</p>
//                     </div>
//                   </div>
//                   <button 
//                     onClick={() => setSelectedUser(null)}
//                     className="p-2 text-indigo-400 hover:text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
//                   >
//                     <XMarkIcon className="w-5 h-5" />
//                   </button>
//                 </div>
//               )}

//               {/* Message Input */}
//               {selectedUser && (
//                 <div>
//                   <textarea
//                     autoFocus
//                     placeholder="Type your message..."
//                     value={text}
//                     onChange={(e) => setText(e.target.value)}
//                     rows={4}
//                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 resize-none"
//                   />
                  
//                   <div className="flex justify-end gap-3 mt-4">
//                     <button 
//                       onClick={() => setOpen(false)}
//                       className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
//                     >
//                       Cancel
//                     </button>
//                     <button 
//                       onClick={submit}
//                       disabled={!text.trim()}
//                       className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
//                         text.trim()
//                           ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
//                           : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
//                       }`}
//                     >
//                       Send Message
//                       <PaperAirplaneIcon className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default CreateMessage;
