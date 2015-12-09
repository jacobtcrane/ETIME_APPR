jQuery.sap.declare("com.broadspectrum.etime.mgr.util.Formatter");

com.broadspectrum.etime.mgr.util.Formatter = {
	commonFieldVisibilityTrigger: function(v) {
		if (v == '' || v == null) {
			return false
		} else {
			return true
		}
	}
};