import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Routes, Route } from 'react-router-dom';
import { ResumeDashboard } from './components/ResumeDashboard';
import { ResumeEditor } from './components/ResumeEditor';
import { DataManager } from './components/DataManager';
import { Layout } from './components/Layout';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen bg-gray-50 font-sans">
          <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
              <div className="font-bold text-xl text-gray-900 tracking-tight">Sections</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden md:block">
                👋 {user?.signInDetails?.loginId}
              </span>
              <button
                onClick={signOut}
                className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </nav>
          <main>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<ResumeDashboard />} />
                <Route path="/data/:category" element={<DataManager />} />
                <Route path="/resume/:id" element={<ResumeEditor />} />
              </Route>
            </Routes>
          </main>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
