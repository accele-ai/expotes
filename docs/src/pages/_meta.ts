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
	"getting-started": "Getting Started",
	"-- separator Advanced": {
		type: "separator",
		title: "Advanced",
	},
	"system-design": "System Design",
	"reverse-proxy": "Reverse Proxy",
	"-- separator Cloud": {
		type: "separator",
		title: "Cloud",
	},
	pricing: "Pricing",
	enterprise: "Enterprise",
	"-- separator extensions": {
		type: "separator",
		title: "Extensions",
	},
};
