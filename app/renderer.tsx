import React from 'react'
import ReactDOM from 'react-dom/client'
import appIcon from '@/resources/build/icon.png'
import { WindowContextProvider, menuItems } from '@/app/components/window'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProjectProvider } from './contexts/ProjectContext'
import App from './app'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WindowContextProvider titlebar={{ title: '', icon: appIcon, menuItems }}>
        <ProjectProvider>
        <App />
        </ProjectProvider>
      </WindowContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
