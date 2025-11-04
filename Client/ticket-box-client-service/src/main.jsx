import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Routes } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import "react-toastify/ReactToastify.css"
import { ToastContainer, Bounce } from "react-toastify";

const routeDefinition = createRoutesFromElements(
  <Route path="/" element={<App />}>
    
  </Route>
);


const appRouter = createBrowserRouter( 
  routeDefinition
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={appRouter} />


    <ToastContainer 
    position="top-center"
    autoClose={2000}
    hideProgressBar={false}
    newestOnTop={false}
    draggable
    pauseOnHover
    transition={Bounce}
    />
  </StrictMode>,
)
