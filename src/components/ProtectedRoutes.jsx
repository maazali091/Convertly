import React from 'react'
import { Navigate } from 'react-router-dom'

function ProtectedRoutes({ user, loading, children }) {
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Checking your session...</p>
            </div>
        );
    }
    if (!user) {
        return <Navigate to='/log-in' replace />
    }
    return children;
}

export default ProtectedRoutes