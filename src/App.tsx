import { HashRouter } from 'react-router-dom'
import Layout from './components/Layout'
import AppRoutes from './app/routes'

function App() {
  return (
    <HashRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </HashRouter>
  )
}

export default App
