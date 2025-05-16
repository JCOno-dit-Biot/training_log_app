import { Navigate } from 'react-router-dom'
import React from 'react';

export default function PrivateRoute( { children }: { children: React.JSX.Element }) {
    const token = localStorage.getItem('access_token');

    return token ? children: <Navigate to ="/" />;
}