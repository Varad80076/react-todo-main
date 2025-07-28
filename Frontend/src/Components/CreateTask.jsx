// CreateTask.jsx
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function CreateTask({ tasks, setTasks }) {
    const [taskName, setTaskName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!taskName) return toast('Task name is required');
        if (tasks.find((t) => t.name === taskName)) return toast('Task already exists');
        if (taskName.length < 3) return toast('Task name must be at least 3 characters');
        if (taskName.length > 20) return toast('Task name must be less than 20 characters');

        const newTask = {
            name: taskName,
            id: uuidv4(),
            status: 'todo'
        };

        axios.post(`${import.meta.env.VITE_API_URL}/tasks`, newTask)
            .then(res => {
        setTasks(prev => [...prev, res.data]); 
                setTaskName("");
                toast.success('Task created successfully');
                // Optionally, you can refresh tasks from the server
                axios.get(`${import.meta.env.VITE_API_URL}/tasks`)
                    .then(res => setTasks(res.data));
                // Or you can just optimistically update the UI as shown above
                setTasks(prev => [...prev, newTask]); // Optimistic update   

            })
            .catch((err) => {
                console.error("Create task error", err);
                toast.error('Failed to create task');
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                onChange={(e) => setTaskName(e.target.value)}
                type="text"
                value={taskName}
                className="border-2 border-slate-400 bg-slate-100 rounded-md mr-4 h-12 w-64 px-1"
            />
            <button className="bg-indigo-500 rounded-md px-4 h-12 text-white">Create</button>
        </form>
    );
}
