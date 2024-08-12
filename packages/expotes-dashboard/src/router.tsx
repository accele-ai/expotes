import { Route, Switch } from 'wouter'

import SidebarLayout from './components/Layout/SidebarLayout'
import CreateApplication from './pages/app/applications/create.tsx'
import Applications from './pages/app/applications/index.tsx'
import Login from './pages/login.tsx'
import Signup from './pages/signup.tsx'

function Router() {
  return (
    <>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/app" nest>
          <SidebarLayout>
            <Route path="/" component={() => <div>2</div>} />
            <Route path="/application" component={Applications} />
          </SidebarLayout>
        </Route>
        {/* Default route in a switch */}
        <Route>404: No such page!</Route>
      </Switch>
    </>
  )
}

export default Router
