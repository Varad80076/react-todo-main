// ListTask.jsx
import { useEffect } from "react";
import { useDrag, useDrop } from 'react-dnd';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ListTask({ tasks, setTasks }) {
    const statuses = ['todo', 'progress', 'done'];

    return (
        <div className="flex gap-16 md:gap-8 flex-wrap justify-center">
            {statuses.map((status, index) => (
                <Section key={index} status={status} tasks={tasks} setTasks={setTasks} />
            ))}
        </div>
    );
}

function Section({ status, tasks, setTasks }) {
    const text = status === 'todo' ? 'To Do' : status === 'progress' ? 'In Progress' : 'Done';
    const bg = status === 'todo' ? 'bg-red-500' : status === 'progress' ? 'bg-yellow-500' : 'bg-green-500';
    const filteredTasks = tasks.filter(task => task.status === status);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "task",
        drop: (item) => {
            if (!item?.id) return;

            // Update backend and refresh all tasks from server
           // inside drop handler
axios.put(`${import.meta.env.VITE_API_URL}/tasks/${item.id}`, { status })
    .then(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/tasks`)
            .then(res => setTasks(res.data)); // ✅ UI updates correctly
            window.location.reload();
            setTasks(prev => prev.map(t => t.id === item.id ? { ...t, status } : t)); // ✅ Optimistic update
            toast.success("Task moved");
        
    })

    .catch(() => toast.error("Failed to update task status"));

        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div ref={drop} className={`w-64 rounded-md mt-2 ${isOver ? 'bg-slate-200' : ''}`}>
            <Header text={text} bg={bg} count={filteredTasks.length} />
            {filteredTasks.map((task, index) => (
                <Task key={index} task={task} setTasks={setTasks} />
            ))}
        </div>
    );
}

function Header({ text, bg, count }) {
    return (
        <div className={`${bg} flex items-center h-12 pl-4 rounded-md uppercase text-sm text-white`}>
            {text}
            <div className="ml-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-black">
                {count}
            </div>
        </div>
    );
}

function Task({ task, setTasks }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "task",
        item: task, // ✅ pass full task object
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const handleDelete = () => {
        // inside handleDelete
axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${task.id}`)
    .then(() => {
        // setTasks(prev => prev.filter(t => t.id !== task.id)); // ✅ UI updates directly
        window.location.reload(); // ✅ Refresh page to ensure all tasks are up-to-date
        axios.get(`${import.meta.env.VITE_API_URL}/tasks`)
        .then(res => setTasks(res.data)); // ✅ Refresh tasks from server
        setTasks(prev => prev.filter(t => t.id !== task.id)); // ✅ Optimistic update
        toast.success("Task deleted");
        
    })
    .catch(() => toast.error("Failed to delete task"));

    };

    return (
        <div
            ref={drag}
            className={`relative flex items-center bg-zinc-200 p-4 mt-8 shadow-md rounded-lg cursor-grab ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            <p className="text-sm">{task.name}</p>
            <i
                className="fas fa-trash ml-auto text-red-500 cursor-pointer"
                onClick={handleDelete}
            ></i>
        </div>
    );
}