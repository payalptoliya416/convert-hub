import { BrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import AppRoutes from './app/routes'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
