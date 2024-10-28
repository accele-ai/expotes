import { Route } from "wouter";

import UpdateList from "@/components/Updates/UpdatesList";

export default function Updates() {
	return (
		<>
			<Route path="/:appId" component={UpdateList} />
			<Route path="/" component={UpdateList} />
		</>
	);
}
