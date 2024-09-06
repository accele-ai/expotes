import { createContext, useContext } from 'react'
import { Helmet } from 'react-helmet'
import useDarkMode from 'use-dark-mode'
import { Route, Switch, useLocation, useParams } from 'wouter'

import { LandingLayout } from './components/Landing/Layout.tsx'
import SidebarLayout from './components/Layout/SidebarLayout'
import { useTheme } from './hooks/useDarkMode.ts'
import Applications from './pages/app/applications.tsx'
import AppHome from './pages/app/home.tsx'
import Updates from './pages/app/updates.tsx'
import Landing from './pages/landing.tsx'
import Login from './pages/login.tsx'
import Pricing from './pages/pricing.tsx'
import Signup from './pages/signup.tsx'
import SessionProvider, {
  SessionGuard,
  TeamContext,
  TeamProvider,
} from './provider/SessionProvider.tsx'
import { usePersistStore } from './store/persist.ts'

function Router() {
  useTheme()

  return (
    <SessionProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Expotes</title>
        <link rel="canonical" href="https://expotes.com" />
      </Helmet>
      <Switch>
        <LandingLayout>
          <Route path="/" component={Landing} />
          <Route path="/pricing" component={Pricing} />
          <SessionGuard>
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
          </SessionGuard>
        </LandingLayout>

        <SessionGuard>
          <TeamProvider>
            <SidebarLayout>
              <Route path="/app" nest>
                <Route path="/home" component={AppHome} />
                <Route path="/applications" component={Applications} />
                <Route path="/updates" nest component={Updates} />
              </Route>
            </SidebarLayout>
          </TeamProvider>
        </SessionGuard>

        {/* Default route in a switch */}
        <Route>404: No such page!</Route>
      </Switch>
    </SessionProvider>
  )
}

export default Router
