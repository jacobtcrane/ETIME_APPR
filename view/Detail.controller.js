jQuery.sap.require("com.broadspectrum.etime.mgr.util.Formatter");
sap.ui.core.mvc.Controller.extend("com.broadspectrum.etime.mgr.view.Detail", {

	onInit: function() {
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		if (sap.ui.Device.system.phone) {
			//Do not wait for the master2 when in mobile phone resolution
			this.oInitialLoadFinishedDeferred.resolve();
		} else {
			var oEventBus = this.getEventBus();
			oEventBus.subscribe("Master2", "LoadFinished", this.onMasterLoaded, this);
		}

		this.getRouter().attachRouteMatched(this.onRouteMatched, this);
		// 		this.oRouter.attachRouteMatched(function(e) {
		// 			if (e.getParameter("name") === "detail") {
		// 				var d = e.getParameter("arguments").contextPath + "/HeaderDetails";
		// 				d = d.replace("WorkflowTaskCollection", "/WorkflowTaskCollection");
		// 				var c = this;
		// 				if (c.sContext !== d || c.sContext === "") {
		// 					this.sContext = d;
		// 					this.refreshScreen(d);
		// 				}
		// 			}
		// 		}, this);
	},

	onMasterLoaded: function(sChannel, sEvent, oData) {
		if (oData.oListItem) {
			this.bindView(oData.oListItem.getBindingContext().getPath());
			this.oInitialLoadFinishedDeferred.resolve();
		}
	},

	onRouteMatched: function(oEvent) {
		var oParameters = oEvent.getParameters();

		jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function() {

			// When navigating in the Detail page, update the binding context 
			if (oParameters.name === "detail") {
				var sEntityPath = "/" + oParameters.arguments.entity;
				this.bindView(sEntityPath);
			} else {
				return;
			}
		}, this));
		var oEventBus = this.getEventBus();
		oEventBus.publish("Detail", "LoadFinished", {
			oListItem: this.getView().byId("DetailList").getItems()[0]
		});
	},

	bindView: function(sEntityPath) {
		var oView = this.getView();
		oView.bindElement(sEntityPath);

		//Check if the data is already on the client
		if (!oView.getModel().getData(sEntityPath)) {

			// Check that the entity specified was found
			var oData = oView.getModel().getData(sEntityPath);
			if (!oData) {
				this.showEmptyView();
				this.fireDetailNotFound();
			} else {
				this.fireDetailChanged(sEntityPath);
			}

		} else {
			this.fireDetailChanged(sEntityPath);
		}

	},

	showEmptyView: function() {
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "com.broadspectrum.etime.mgr.view.NotFound",
			targetViewType: "XML"
		});
	},

	fireDetailChanged: function(sEntityPath) {
		this.getEventBus().publish("Detail", "Changed", {
			sEntityPath: sEntityPath
		});
	},

	fireDetailNotFound: function() {
		this.getEventBus().publish("Detail", "NotFound");
	},

	onNavBack: function() {
		// This is only relevant when running on phone devices
		this.getRouter().myNavBack("main");
	},

	onDetailSelect: function(oEvent) {
		sap.ui.core.UIComponent.getRouterFor(this).navTo("detail", {
			entity: oEvent.getSource().getBindingContext().getPath().slice(1)
		}, true);
	},

	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},

	onExit: function(oEvent) {
		this.getEventBus().unsubscribe("Master2", "LoadFinished", this.onMasterLoaded, this);
	},

	onNavToItemDetails: function(e) {
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "com.broadspectrum.etime.mgr.view.Detail2",
			targetViewType: "XML",
			transition: "slide"
		});
		var b = e.getSource().getBindingContext().getPath();
		var m = this.getView().getModel();
		//the date is formatted to a string so we get it from the path and reformat since its easier and should be the same at this point		
		var dateworked = b.split(",")[1];
		dateworked = dateworked.replace(/%3A/g, ':');
		dateworked = dateworked.split('=')[1];
		this.getRouter().navTo("detail2", {
			Epernr: this.oView.getBindingContext().getProperty("Epernr"),
			// 			Dateworked: this.oView.getBindingContext().getProperty("Dateworked"),
			Dateworked: dateworked,
			Seqnr: m.getProperty(b).Seqnr
		}, true);

//         this.getRouter().navTo("detail2", {
// 			from: "detail01",
// 			entity: b
// 		}, true);
		//     		this.getRouter().myNavToWithoutHash({ 
		//     			currentView : this.getView(),
		//     			targetViewName : "com.broadspectrum.etime.mgr.view.Detail2",
		//     			targetViewType : "XML",
		//     			transition : "slide"
		//     		});
	}
});