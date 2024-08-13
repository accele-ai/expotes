import { createContext, useContext } from 'react'
import { Route, Switch, useLocation, useParams } from 'wouter'

import SidebarLayout from './components/Layout/SidebarLayout'
import Applications from './pages/app/applications.tsx'
import Updates from './pages/app/updates.tsx'
import Login from './pages/login.tsx'
import Signup from './pages/signup.tsx'
import { usePersistStore } from './store/persist.ts'

const TeamContext = createContext<{ id: string } | null>(null)

export const getTeam = () => {
  const [_, setLocation] = useLocation()
  const team = useContext(TeamContext)

  if (!team) {
    throw setLocation('/login')
  }

  return team
}

function Router() {
  const { teamId } = usePersistStore()

  return (
    <>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route
          path="/user/:id"
          component={() => {
            const params = useParams()
            return <div>User ID: {params.id}</div>
          }}
        />
        <Route path="/app" nest>
          <TeamContext.Provider value={teamId ? { id: teamId } : null}>
            <SidebarLayout>
              <Route path="/" component={() => <div>2</div>} />
              <Route path="/applications" component={Applications} />
              <Route path="/updates" nest component={Updates} />
            </SidebarLayout>
          </TeamContext.Provider>
        </Route>
        {/* Default route in a switch */}
        <Route>404: No such page!</Route>
      </Switch>
    </>
  )
}

export default Router
