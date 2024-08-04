import { Link, Route, Switch } from "wouter";
import Login from "./pages/signup.tsx";
import SidebarLayout from "./components/Layout/SidebarLayout";
import Signup from "./pages/signup.tsx";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/app" nest>
          <SidebarLayout>
            <Route path="/" component={() => <div>2</div>} />
          </SidebarLayout>
        </Route>
        {/* Default route in a switch */}
        <Route>404: No such page!</Route>
      </Switch>
    </>
  );
}

export default Router;
