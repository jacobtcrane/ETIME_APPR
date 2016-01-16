sap.ui.core.mvc.Controller.extend("com.broadspectrum.etime.mgr.view.Welcome", {
	onInit: function() {
		this.getRouter().attachRouteMatched(this.onRouteMatched, this);
		this.oRoutingParams = {};
	},

	onRouteMatched: function(oEvent) {
		var oParameters = oEvent.getParameters();
		// set welcome page description according to navigation
		if (oParameters.name === "welcome") {
			this.byId("messagePage").setDescription("Select a team member from the list to get started.");
		}
		if (oParameters.name === "timesheets") {
			this.byId("messagePage").setDescription("Select a timesheet to view, approve or reject details.");
		}
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	}
});