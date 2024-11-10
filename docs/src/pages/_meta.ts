export default {
	"*": {
		theme: {
			breadcrumb: false,
		},
	},
	index: {
		display: "hidden",
		type: "page",
		title: "Home",
		theme: {
			layout: "raw",
			breadcrumb: false,
			footer: true,
			sidebar: false,
			toc: false,
			pagination: false,
		},
	},
	"-- docs": {
		title: "Docs",
		type: "page",
		href: "/getting-started",
	},
	"change-log": {
		title: "Change Log",
		href: "https://github.com/expotes/expotes/releases",
		type: "page",
		newWindow: true,
	},
	"-- separator guide": {
		type: "separator",
		title: "Guide",
	},
	// "getting-started": "Getting Started",
	// "best-practice": "Best Practice",
	// "where-is": "Where is ...?",
	"-- separator hooks": {
		type: "separator",
		title: "Hooks",
	},
	"-- separator components": {
		type: "separator",
		title: "Components",
	},
	// "compose-context-provider": {},
	// "current-year": {},
	// "-- separator utilities": {
	// 	type: "separator",
	// 	title: "Utilities",
	// },
	// "context-state": {},
	// "context-local-storage-state": {},
	// "context-session-storage-state": {},
	// "create-fixed-array": {},
	// "invariant-nullthrow": {},
	// noop: {},
	// "no-ssr": {},
	// rem: {},
	// "request-idle-callback": {},
	// "typescript-happy-forward-ref": {},
	"-- separator extensions": {
		type: "separator",
		title: "Extensions",
	},
	// "use-next-link": {},
	// "use-next-pathname": {},
	// "use-react-router-enable-concurrent-navigation": {},
	// "use-react-router-is-match": {},
};
