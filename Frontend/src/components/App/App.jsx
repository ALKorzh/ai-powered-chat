import React from 'react';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import classes from './App.module.css'
import Layout from "../../routes/Layout/Layout.jsx";
import Home from "../../routes/Home/Home.jsx";
import Authorization from "../../routes/Authorization/Authorization.jsx";
import Registration from "../../routes/Registration/Registration.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout/>,
        children: [
            {
                path: '/',
                element: <Home/>
            },
            {
                path: '/authorization',
                element: <Authorization/>
            },
            {
                path: '/registration',
                element: <Registration/>
            }
        ]
    }
])

const App = () => {
    return <RouterProvider router={router}/>;
};

export default App;