import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './features/knowledge-base/components/Dashboard';
import { KnowledgeBaseDetail } from './features/knowledge-base/components/KnowledgeBaseDetail';

function App() {
    return (
        <Authenticator>
            {({ signOut, user }) => (
                <div className="min-h-screen bg-slate-50 flex flex-col">
                    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Knowledge Sections
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 w-auto text-right">
                                {user?.signInDetails?.loginId && `Hello, ${user.signInDetails.loginId}`}
                            </span>
                            <button
                                onClick={signOut}
                                className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 container mx-auto max-w-5xl py-8 px-4">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/kb/:id" element={<KnowledgeBaseDetail />} />
                        </Routes>
                    </main>
                </div>
            )}
        </Authenticator>
    );
}

export default App;
