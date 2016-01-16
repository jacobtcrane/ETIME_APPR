sap.ui.core.mvc.Controller.extend("com.broadspectrum.etime.mgr.view.Master", {

	onInit: function() {
		this.getRouter().attachRouteMatched(this.onRouteMatched, this);
		this.getRouter().attachRoutePatternMatched(this.onRoutePatternMatched, this);
		this.oRoutingParams = {};
	},

	onRouteMatched: function(oEvent) {
		var oParameters = oEvent.getParameters();
		if (oParameters.name === "home") {
			// nothing to do here
		}
	},

	onRoutePatternMatched: function(oEvent) {
		var oParameters = oEvent.getParameters();
		if (oParameters.name === "home") {
			if (!sap.ui.Device.system.phone) {
				// load the welcome page on non-phone devices (splitapp behaves like a
				// single nav controller on phones, so the master list has to be shown first)
				// note that this has to happen on the RoutePatternMatched event as this
				// only traps a route actually being matched. 
				// intermediate RouteMatched events (such as "home" being loaded as a parent
				// route of "detail", are not trapped by this event)
				this.getRouter().navTo("welcome");
			}
		}
	},

	onNotFound: function() {
		this.getView().byId("master1List").removeSelections();
	},

	onSearch: function() {
		// Add search filter
		var filters = [];
		var searchString = this.getView().byId("master1SearchField").getValue();
		if (searchString && searchString.length > 0) {
			filters = [new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, searchString)];
		}

		// Update list binding
		this.getView().byId("master1List").getBinding("items").filter(filters);
	},

	onSelect: function(oEvent) {
		// Get the list item either from the listItem parameter or from the event's
		// source itself (will depend on the device-dependent mode)
		var oList = this.getView().byId("master1List");
		this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		oList.removeSelections();
	},

	showDetail: function(oItem) {
		this.getRouter().navTo("timesheets", {
			TeamViewEntity: oItem.getBindingContext().getPath().substr(1) // no slash in router param
		});
	},

	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},

	onExit: function(oEvent) {
		this.getEventBus().unsubscribe("Master2", "NotFound", this.onNotFound, this);
	}
});