jQuery.sap.require("com.broadspectrum.etime.mgr.util.Formatter");
jQuery.sap.require("com.broadspectrum.etime.mgr.util.Dialogs");
jQuery.sap.require("sap.m.MessageBox");

sap.ui.core.mvc.Controller.extend("com.broadspectrum.etime.mgr.view.Detail", {

	onInit: function() {
		this.getRouter().attachRouteMatched(this.onRouteMatched, this);
		this.oRoutingParams = {};
		var oEventBus = this.getEventBus();
		oEventBus.subscribe("DetailViewSet2", "Changed", this.onDetailChanged, this);
	},

	onRouteMatched: function(oEvent) {
		var oParameters = oEvent.getParameters();
		if (oParameters.name === "detail") {
			if (oParameters.arguments.TeamViewEntity &&
				oParameters.arguments.EmployeeViewEntity) {
				this.oRoutingParams.TeamViewEntity = oParameters.arguments.TeamViewEntity;
				this.oRoutingParams.EmployeeViewEntity = oParameters.arguments.EmployeeViewEntity;
			} else {
				this.getRouter().navTo("notfound", {}, true); // don't create a history entry
				return;
			}
			this.bindView("/" + this.oRoutingParams.EmployeeViewEntity);
			this.checkSubmitButtonEnabled();
		}
	},

	onDetailChanged: function(sChanel, sEvent, oData) {
		this.bindView(this.keyForView);
		this.fireDetailChanged("");
	},

	bindView: function(sEntityPath) {
		this.keyForView = sEntityPath;
		var oView = this.getView();
		oView.bindElement(sEntityPath);

		//Check if the data is already on the client
		if (!this.getModel().getData(sEntityPath)) {

			// Check that the entity specified was found
			oView.getElementBinding().attachEventOnce("dataReceived", jQuery.proxy(function() {
				var oData = this.getModel().getData(sEntityPath);
				if (!oData) {
					this.showEmptyView();
					this.fireDetailNotFound();
				}
			}, this));
		}

	},

	showEmptyView: function() {
		this.getRouter().navTo("notfound", {}, true); // don't create a history entry
	},

	fireDetailChanged: function(sEntityPath) {
		this.getEventBus().publish("DetailViewSet1", "Changed");
	},

	fireDetailNotFound: function() {
		this.getEventBus().publish("Detail", "NotFound");
	},

	getSwitchStateForStatus: function(Status) {
		if (Status === "APP") {
			return true;
		} else {
			return false;
		}
	},

	checkSubmitButtonEnabled: function() {
		if (this.getModel().hasPendingChanges()) {
			this.byId("submitButton").setEnabled(true);
		} else {
			this.byId("submitButton").setEnabled(false);
		}
	},

	onSwitchChanged: function(oEvent) {
		var oModel = this.getModel();
		var sContextPath = oEvent.getSource().getBindingContext().getPath();
		var pathStatus = sContextPath + '/Status';
		var pathStatustxt = sContextPath + '/Statustxt';
		if (oEvent.getParameters().state) {
			// set status as approved
			oModel.setProperty(pathStatus, "APP");
			oModel.setProperty(pathStatustxt, 'Approved');
		} else {
			// return status to original
			// oModel.setProperty(pathStatus, oModel.getOriginalProperty(pathStatus));    // getOriginalProperty() not available in current runtime?
			// in the absence of method getOriginalProperty() we'll this.  Potential spot for improvement post-upgrade
			var oOriginalObject = oModel.oData[sContextPath.substr(1)];
			if (oOriginalObject && oOriginalObject.Status && oOriginalObject.Statustxt) {
				oModel.setProperty(pathStatus, oOriginalObject.Status);
				oModel.setProperty(pathStatustxt, oOriginalObject.Statustxt);
				sap.m.MessageToast.show("Reverted to original status (" + oOriginalObject.Statustxt + ")...");
			}
		}
		oEvent.cancelBubble();
		this.checkSubmitButtonEnabled();
	},

	onSelectAllPressed: function(oEvent) {
		var oModel = this.getModel();
		var aItems = this.byId("detailList").getItems();
		aItems.forEach(function(oItem) {
			// set approved status on each bound model object 
			oModel.setProperty(oItem.getBindingContext().getPath() + "/Status", "APP");
		});
		this.checkSubmitButtonEnabled();
	},

	onSubmitPressed: function(oEvent) {
		var oModel = this.getModel();
		// remove all current messages from message manager
		sap.ui.getCore().getMessageManager().removeAllMessages();

		// note that we have to specify this submission is only for deferred batch group "detailChanges"
		// otherwise all service calls get batched together and the success/error outcome is clouded
		oModel.submitChanges({
			success: $.proxy(function() {
				// check for messages
				if (sap.ui.getCore().getMessageManager().getMessageModel().oData.length > 0) {
					// show odata errors in message popover
					this.showMessagePopover(this.byId("toolbar"));
				} else {
					// raise a toast to the user!
				// 	this.navHistoryBack(); //replaced for now as Welcome seems to make more sense. Get feedback in UAT
					this.onDetailChanged();
					sap.m.MessageToast.show("Approvals submitted");
				    this.getRouter().navTo("welcome");
				}
			}, this),
			error: $.proxy(function() {
				// show odata errors in message popover
				this.showMessagePopover(this.byId("toolbar"));
				var msg = 'Approvals submit encountered errors! Pleae review and retry.';
				sap.m.MessageToast.show(msg);
			}, this)
		});
	},

	showMessagePopover: function(oOpenBy) {
		com.broadspectrum.etime.mgr.util.Dialogs.getMessagePopover(this).openBy(oOpenBy || this.getView());
	},

	onNavBack: function() {
		this.navHistoryBack();
	},

	navHistoryBack: function() {
		window.history.go(-1);
	},

	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getModel: function() {
		return sap.ui.getCore().getModel();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},

	onExit: function(oEvent) {
		this.getEventBus().unsubscribe("Master2", "LoadFinished", this.onMasterLoaded, this);
	},

	onDetailListItemTap: function(oEvent) {
		// Get the list item either from the listItem parameter or from the event's
		// source itself (will depend on the device-dependent mode)
		this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
	},

	showDetail: function(oItem) {
		this.getRouter().navTo("approval", {
			TeamViewEntity: this.oRoutingParams.TeamViewEntity,
			EmployeeViewEntity: this.oRoutingParams.EmployeeViewEntity,
			DetailViewEntity: oItem.getBindingContext().getPath().substr(1) // no slash in router param
		});
	}
});