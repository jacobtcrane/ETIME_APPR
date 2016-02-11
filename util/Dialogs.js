jQuery.sap.declare("com.broadspectrum.etime.mgr.util.Dialogs");

com.broadspectrum.etime.mgr.util.Dialogs = {
	getMessagePopover: function(oController) {
		// prepare message popover dialog if not yet done
		if (!oController.getOwnerComponent()._dialogMessagePopover) {
			oController.getOwnerComponent()._dialogMessagePopover = sap.ui.xmlfragment("com.broadspectrum.etime.mgr.dialogs.MessagePopover", oController);
			oController.getOwnerComponent()._dialogMessagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel());
		}
		// filter out messages without an actual message
		// 	var oFilter = new sap.ui.model.Filter("message", sap.ui.model.FilterOperator.NE, "");
		// 	if (oController.getOwnerComponent()._dialogMessagePopover.getBinding("items")) {
		// 		oController.getOwnerComponent()._dialogMessagePopover.getBinding("items").filter([oFilter]);
		// 	}
		// filter method only works in higher UI5 runtime, potentially implement post-upgrade
		var aFilteredMessages = $.map(sap.ui.getCore().getMessageManager().getMessageModel().oData, function(oMessage) {
			if (oMessage.message) {
				return oMessage;
			}
		});
		sap.ui.getCore().getMessageManager().removeMessages(sap.ui.getCore().getMessageManager().getMessageModel().oData);
		sap.ui.getCore().getMessageManager().addMessages(aFilteredMessages);
		
		return oController.getOwnerComponent()._dialogMessagePopover;
	}
};