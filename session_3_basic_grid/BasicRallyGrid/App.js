// Custom Rally App that displays Stories in a grid.
//
// Note: various console debugging messages intentionally kept in the code for learning purposes

Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css

	myGrid: undefined,
	myStore: undefined,

    // Entry Point to App
    launch: function() {
		
		console.log('our second app');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api
		this.pulldownContainer = Ext.create('Ext.container.Container',{
			layout: {
				type: 'hbox',
				align: 'stretch'
			}
		})
		
		this.add(this.pulldownContainer);
		this._loadIterations();

    },


	_loadIterations: function(){
		this.iterComboBox = Ext.create ('Rally.ui.combobox.IterationComboBox', {
			fieldLabel: 'Iteration',
			labelAlign: 'right',
			width: '300',
			listeners: {
				ready: function(combobox){
					//old this._loadData();
					this._loadSeverities();
				},
				select: function(combobox, records){
					this._loadData();
				},
				scope: this
			}
		});
		this.pulldownContainer.add(this.iterComboBox);		
	},
	
	_loadSeverities: function(){
		this.severityComboBox = Ext.create ('Rally.ui.combobox.FieldValueComboBox', {
			fieldLabel: 'Severity',
			labelAlign: 'right',
			width: '300',
			model: 'Defect',
        	field: 'Severity',	
			listeners: {
				ready: function(combobox){
					this._loadData();
				},
				select: function(combobox, records){
					this._loadData();
				},
				scope: this
			}
		});		
		this.pulldownContainer.add(this.severityComboBox);		
	},
	
    // Get data from Rally
    _loadData: function() {
		var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
	   var selectedSeverityValue = this.severityComboBox.getRecord().get('value');
	   console.log ('loading data');
	   var myFilters = [
		   {
			   property: 'Iteration',
			   operation: "=",
	    	   value: selectedIterRef
			},
			{
				property: 'Severity',
				operation: "=",
				value: selectedSeverityValue
			}
		];
		
	//if store exists then just load data
	if (this.defectStore) {
		this.defectStore.setFilter(myFilters);
		this.defectStore.load();
	}else{
		
		// else load store
		  this.defectStore = Ext.create('Rally.data.wsapi.Store', {
			  model: 'Defect',
 			  autoLoad: true,                         // <----- Don't forget to set this to true! function heh(args) 
			  filters: myFilters,
			  listeners: {
				  load: function() {
            		console.log('got grid?', this.myGrid);
					if (!this.myGrid) {
						console.log('not grid, so create');
              			this._createGrid(this.defectStore)      // if we did NOT pass scope:this below, this line would be incorrectly trying to call _createGrid() on the store which does not exist.
					}
            	},
        		scope: this                         // This tells the wsapi data store to forward pass along the app-level context into ALL listen functions
    		},
			fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']   // Look in the WSAPI docs online to see all fields available!
    	});
	};
},

    // Create and Show a Grid of given stories
    _createGrid: function(myDefectStore) {

      this.myGrid = Ext.create('Rally.ui.grid.Grid', {

        store: myDefectStore,
        columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
          'FormattedID', 'Name', 'Severity', 'Iteration'
        ]
      });
	  console.log ('Creating grid');
      this.add(this.myGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)



    }

});
