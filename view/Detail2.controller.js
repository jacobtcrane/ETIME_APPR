jQuery.sap.require("com.broadspectrum.etime.mgr.util.Formatter");
jQuery.sap.require("sap.m.MessageBox");

sap.ui.core.mvc.Controller.extend("com.broadspectrum.etime.mgr.view.Detail2", {

	onInit: function() {
		this.getRouter().attachRouteMatched(this.onRouteMatched, this);
		this.oRoutingParams = {};
	},

	onRouteMatched: function(oEvent) {
		var oParameters = oEvent.getParameters();
		if (oParameters.name === "approval") {
			if (oParameters.arguments.TeamViewEntity &&
				oParameters.arguments.EmployeeViewEntity &&
				oParameters.arguments.DetailViewEntity) {
				this.oRoutingParams.TeamViewEntity = oParameters.arguments.TeamViewEntity;
				this.oRoutingParams.EmployeeViewEntity = oParameters.arguments.EmployeeViewEntity;
				this.oRoutingParams.DetailViewEntity = oParameters.arguments.DetailViewEntity;
			} else {
				this.getRouter().navTo("notfound", {}, true); // don't create a history entry
				return;
			}
			this.bindView("/" + this.oRoutingParams.DetailViewEntity);
		}
	},

	bindView: function(sEntityPath) {
		var oView = this.getView();
		oView.bindElement(sEntityPath);
	},

	showEmptyView: function() {
		this.getRouter().navTo("notfound", {}, true); // don't create a history entry
	},

	fireDetailChanged: function(sEntityPath) {
		this.getEventBus().publish("DetailViewSet2", "Changed", {
			sEntityPath: sEntityPath
		});
	},

	fireDetailNotFound: function() {
		this.getEventBus().publish("DetailViewSet2", "NotFound");
	},

	getHeaderStatusState: function(Status) {
		if (Status === "SUB") {
			return sap.ui.core.ValueState.None;
		}
		if (Status === "APP") {
			return sap.ui.core.ValueState.Success;
		}
		if (Status === "REJ") {
			return sap.ui.core.ValueState.Error;
		}
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

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},

	getModel: function() {
		return sap.ui.getCore().getModel();
	},

	onExit: function(oEvent) {},

	onRejectDialog: function() {
		var oModel = this.getModel();
		var dialog = new sap.m.Dialog({
			title: 'Reject',
			type: 'Message',
			content: [
				new sap.m.Text({
					text: 'Are you sure you want to reject this entry?'
				}),
				new sap.m.TextArea('rejectDialogTextarea', {
					width: '100%',
					placeholder: 'Add note (required)'
				})
			],
			beginButton: new sap.m.Button({
				type: 'Reject',
				text: 'Reject',
				press: $.proxy(function() {
					this.getView().setBusy(true);
					var rejectionNote = sap.ui.getCore().byId('rejectDialogTextarea').getValue();
					if (!rejectionNote) {
						dialog.close();
						sap.m.MessageToast.show("A rejection note is required. Please try again...");
						return;
					}
					// mark changes in the model; we'll submit them on the timesheet detail page
					var sContextPath = this.getView().getBindingContext().getPath();
					var path = sContextPath + '/Status';
					oModel.setProperty(path, 'REJ');
					path = sContextPath + '/Statustxt';
					oModel.setProperty(path, 'Rejected');
					path = sContextPath + '/Mnote';
					oModel.setProperty(path, rejectionNote);
					dialog.close();
					oModel.submitChanges({
						success: $.proxy(function() {
							// TODO: until we can figure out why batching doesn't work, check for messages
							this.getView().setBusy(false);
							//DJ: What's the point of this commented-out code? showMessagePopover doesn't even exist in this js
							// if (sap.ui.getCore().getMessageManager().getMessageModel().oData.length > 0) {
							// 	// show odata errors in message popover
							// 	this.showMessagePopover(this.byId("toolbar"));
							// } else {
								// raise a toast to the user!
								this.navHistoryBack();
								this.fireDetailChanged();
								sap.m.MessageToast.show("Rejection submitted");
							// }
						}, this),
						error: $.proxy(function() {
							// show odata errors in message popover
							// this.showMessagePopover(this.byId("toolbar"));
							this.getView().setBusy(false);
							var msg = 'Rejection submit encountered errors! Pleae review and retry.';
							sap.m.MessageToast.show(msg);
						}, this)
					});
					// 	this.navHistoryBack();
				}, this)
			}),
			endButton: new sap.m.Button({
				text: 'Cancel',
				press: $.proxy(function() {
					dialog.close();
				}, this)
			}),
			afterClose: function() {
				dialog.destroy();
			}
		});

		dialog.open();
	},
	onApprove: function() {
		this.getView().setBusy(true);
		var oModel = this.getModel();
		// mark changes in the model; we'll submit them on the timesheet detail page
		var sContextPath = this.getView().getBindingContext().getPath();
		var path = sContextPath + '/Status';
		oModel.setProperty(path, 'APP');
		path = sContextPath + '/Statustxt';
		oModel.setProperty(path, 'Approved');
		oModel.submitChanges({
			success: $.proxy(function() {
				this.getView().setBusy(false);
				//DJ: What's the point of this commented-out code? showMessagePopover doesn't even exist in this js
				// TODO: until we can figure out why batching doesn't work, check for messages
				// if (sap.ui.getCore().getMessageManager().getMessageModel().oData.length > 0) {
				// 	// show odata errors in message popover
				// 	this.showMessagePopover(this.byId("toolbar"));
				// } else {
					// raise a toast to the user!
					this.navHistoryBack();
					this.fireDetailChanged();
					sap.m.MessageToast.show("Approvals submitted");
				// }

			}, this),
			error: $.proxy(function() {
				this.getView().setBusy(false);
				// show odata errors in message popover
				// this.showMessagePopover(this.byId("toolbar"));
				var msg = 'Approvals submit encountered errors! Pleae review and retry.';
				sap.m.MessageToast.show(msg);
			}, this)
		});
		// 		this.navHistoryBack();
	}

});