import { Route } from 'wouter'

import ApplicationList from '@/components/Application/ApplicationList'
import CreateApplication from '@/components/Application/CreateApplication'

export default function Applications() {
  return (
    <Route path="" nest>
      <Route path="/" component={ApplicationList} />
      <Route path="/create" component={CreateApplication} />
    </Route>
  )
}
