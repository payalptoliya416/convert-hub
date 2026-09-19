import { HashRouter } from 'react-router-dom'
import Layout from './components/Layout'
import AppRoutes from './app/routes'
import WhyChooseUs from './components/WhyChooseUs'
import HowItWorks from './components/HowItWorks'
import TrustedStats from './components/TrustedStats'
import FooterFile from './components/FooterFile'


function App() {
  return (
    <HashRouter>
      <Layout>
        <AppRoutes />
        <WhyChooseUs/>
        <HowItWorks/>
        <TrustedStats/>
        <FooterFile/>
      </Layout>
    </HashRouter>
  )
}

export default App
