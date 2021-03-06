jQuery.sap.declare("com.broadspectrum.etime.mgr.Component");

sap.ui.core.UIComponent.extend("com.broadspectrum.etime.mgr.Component", {
    		createContent : function(){
		    this.view = sap.ui.view({
		        id:'ZHTR_ETIME_MGR',
		        viewName: 'com.broadspectrum.etime.mgr.view.App',
		        type : sap.ui.core.mvc.ViewType.XML, 
		        viewData : { component : this }  
		    });
		    return this.view;  
		},
	metadata: {
		name: "My Timesheets Approval App",
		version: "1.0",
		includes: ['css/style.css'],
		dependencies: {
			libs: ["sap.m", "sap.ui.layout"],
			components: []
		},

		rootView: "com.broadspectrum.etime.mgr.view.App",

		config: {
			resourceBundle: "i18n/messageBundle.properties",
			serviceConfig: {
				name: "ZHTR_ETIME_MANAGER_SRV",
				serviceUrl: "/sap/opu/odata/sap/ZHTR_ETIME_MANAGER_SRV/"
			}
		},

		routing: {
			config: {
				routerClass: "sap.m.routing.Router",
				viewType: "XML",
				viewPath: "com.broadspectrum.etime.mgr.view",
				clearTarget: false,
				transition: "slide"
			},
			routes: [
				{
					name: "home",
					pattern: "",
					target: "home",
					subroutes: [
						{
							name: "welcome",
							pattern: "welcome",
							target: "welcome",
							subroutes: [
								{
									name: "timesheets",
									pattern: "{TeamViewEntity}/timesheets",
									target: "timesheets",
									subroutes: [
										{
											name: "detail",
											pattern: "{TeamViewEntity}/timesheets/{EmployeeViewEntity}/detail",
											target: "detail",
											subroutes: [
												{
													name: "approval",
													pattern: "{TeamViewEntity}/timesheets/{EmployeeViewEntity}/detail/{DetailViewEntity}/approval",
													target: "approval"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
						{
							pattern: "notfound",
							name: "notfound",
							target: "notfound"
                        }
                    ]
                }
			],
			targets: {
				home: {
					viewName: "Master",
					controlId: "idAppControl",
					controlAggregation: "masterPages"
				},
				timesheets: {
					viewName: "Master2",
					controlId: "idAppControl",
					controlAggregation: "masterPages"
				},
				welcome: {
					viewName: "Welcome",
					controlId: "idAppControl",
					controlAggregation: "detailPages"
				},
				detail: {
					viewName: "Detail",
					controlId: "idAppControl",
					controlAggregation: "detailPages"
				},
				approval: {
					viewName: "Detail2",
					controlId: "idAppControl",
					controlAggregation: "detailPages"
				},
				notfound: {
					viewName: "NotFound",
					controlId: "idAppControl",
					controlAggregation: "detailPages"
				}
			}
		}
	},

	init: function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		var mConfig = this.getMetadata().getConfig();

		// Always use absolute paths relative to our own component
		// (relative paths will fail if running in the Fiori Launchpad)
		var oRootPath = jQuery.sap.getModulePath("com.broadspectrum.etime.mgr");

		// Set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [oRootPath, mConfig.resourceBundle].join("/")
		});
		this.setModel(i18nModel, "i18n");

		var sServiceUrl = mConfig.serviceConfig.serviceUrl;

		//This code is only needed for testing the application when there is no local proxy available
		var bIsMocked = jQuery.sap.getUriParameters().get("responderOn") === "true";
		// Start the mock server for the domain model
		if (bIsMocked) {
			this._startMockServer(sServiceUrl);
		}

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl);
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		oModel.setRefreshAfterChange(true);
		this.setModel(oModel);
		sap.ui.getCore().setModel(oModel);

		// Set device model
		var oDeviceModel = new sap.ui.model.json.JSONModel({
			isTouch: sap.ui.Device.support.touch,
			isNoTouch: !sap.ui.Device.support.touch,
			isPhone: sap.ui.Device.system.phone,
			isNoPhone: !sap.ui.Device.system.phone,
			listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
			listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
		});
		oDeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(oDeviceModel, "device");

		this.getRouter().initialize();

	},

	_startMockServer: function(sServiceUrl) {
		jQuery.sap.require("sap.ui.core.util.MockServer");
		var oMockServer = new sap.ui.core.util.MockServer({
			rootUri: sServiceUrl
		});

		var iDelay = +(jQuery.sap.getUriParameters().get("responderDelay") || 0);
		sap.ui.core.util.MockServer.config({
			autoRespondAfter: iDelay
		});

		oMockServer.simulate("model/metadata.xml", "model/");
		oMockServer.start();

		sap.m.MessageToast.show("Running in demo mode with mock data.", {
			duration: 2000
		});
	}
});