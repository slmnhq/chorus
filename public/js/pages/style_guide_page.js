chorus.pages.StyleGuidePage = chorus.pages.Base.extend({
    setup:function () {
        this.mainContent = new chorus.views.MainContentView({
            content:new chorus.views.StaticTemplate("style_guide"),
            contentHeader:new chorus.views.StaticTemplate("default_content_header", {title:'Style Guide Page'}),
            contentDetails:new chorus.views.StaticTemplate("plain_text", {text:'Design rules for a happy family.'})
        });

        //sidebar is optional
        this.sidebar = new chorus.views.StaticTemplate("plain_text", {text:"sidebar is 250px wide"})

        //subnavs require a workspace and are optional
        this.workspace = new chorus.models.Workspace({ description:"One awesome workspace"})
        this.workspace.loaded = true;
        this.subNav = new chorus.views.SubNav({model:this.workspace, tab:"workfiles"})

    },

    postRender:function () {
        var siteElements = new chorus.pages.StyleGuidePage.SiteElementsView()
        $(this.el).append(siteElements.render().el)
    }
});

chorus.pages.StyleGuidePage.SiteElementsView = Backbone.View.extend({
    tagName:"ul",
    className:"views",

    initialize:function () {
        _.defer(_.bind(this.render, this));
        this.workspace = new chorus.models.Workspace({ description:"One awesome workspace"})
        this.workspace.loaded = true;
        this.subNav = new chorus.views.SubNav({model:this.workspace, tab:"workfiles"})

        //necessary for collection views down at the bottom
        this.loadingCollection = new chorus.collections.UserSet();
        this.userCollection = new chorus.collections.UserSet([
            new chorus.models.User({ userName:"edcadmin", fullName:"Johnny Danger", admin:false, id:"InitialUser"}),
            new chorus.models.User({ userName:"edcadmin", fullName:"Laurie Blakenship", admin:true, id:"InitialUser"}),
            new chorus.models.User({ userName:"edcadmin", fullName:"George Gorilla", admin:false, id:"InitialUser"})
        ]);

        this.userCollection.loaded = true;

        this.task = (function() {
            var animals = ['aardvark', 'bat', 'cheetah'];
            var columns = [
                { name: "id" },
                { name: "value" },
                { name: "animal" }
            ];
            var rows = _.map(_.range(50), function(i) {
                return {
                    id: i,
                    value : Math.round(100 * Math.random(), 0),
                    animal : _.shuffle(animals)[0]
                }
            });

            return new chorus.models.SqlExecutionTask({
                columns: columns,
                rows: rows
            });
        })();

        this.views = {
            "Header" : new chorus.views.Header(),

            "Breadcrumbs":new chorus.views.BreadcrumbsView({
                breadcrumbs:[
                    { label:t("breadcrumbs.home"), url:"#/" },
                    { label:t("breadcrumbs.users"), url:"#/users" },
                    { label:t("breadcrumbs.new_user") }
                ]
            }),

            "Sub Nav":new chorus.views.SubNav({model:this.workspace, tab:"summary"}),

            "Link Menu":new chorus.views.LinkMenu({title:"Link Menu", options:[
                {data:"first", text:"Text of first option"},
                {data:"second", text:"Text of second option"}
            ]}),

            "Basic Main Content View":new chorus.views.MainContentView({
                contentHeader:new chorus.views.StaticTemplate("default_content_header", {title:'Content Header'}),
                contentDetails:new chorus.views.StaticTemplate("plain_text", {text:'Content Details'}),
                content:new chorus.views.StaticTemplate("ipsum")
            }),

            "Font Styles":new chorus.views.StyleGuideFonts(),

            "List Page (loading)":new chorus.views.MainContentList({modelClass:"User", collection:this.loadingCollection}),

            "List Page":new chorus.views.MainContentList({
                modelClass:"User",
                collection:this.userCollection,
                linkMenus:{
                    sort:{
                        title:t("users.header.menu.sort.title"),
                        options:[
                            {data:"firstName", text:t("users.header.menu.sort.first_name")},
                            {data:"lastName", text:t("users.header.menu.sort.last_name")}
                        ],
                        event:"sort",
                        chosen:t("users.header.menu.sort.last_name")
                    }
                },
                buttons:[
                    {
                        url:"#/users/new",
                        text:"Create Thing"
                    },
                    {
                        url:"#/users/new",
                        text:"Create Other Thing"
                    }
                ]
            }),

            "Data Table":new chorus.views.TaskDataTable({
                model:new chorus.models.SqlExecutionTask({ result:{
                    columns:[
                        { name:"id" },
                        { name:"city" },
                        { name:"state" },
                        { name:"zip" },
                        { name:"other_state" },
                        { name:"other_zip" }
                    ],
                    rows:[
                        { id:1, city:"Oakland", state:"CA", zip:"94612", other_state:"CA", other_zip:"94612" },
                        { id:2, city:"Arcata", state:"CA", zip:"95521", other_state:"CA", other_zip:"95521" },
                        { id:3, city:"Lafayette", state:"IN", zip:"47909", other_state:"IN", other_zip:"47909" },
                        { id:1, city:"Oakland", state:"CA", zip:"94612", other_state:"CA", other_zip:"94612" },
                        { id:2, city:"Arcata", state:"CA", zip:"95521", other_state:"CA", other_zip:"95521" },
                        { id:3, city:"Lafayette", state:"IN", zip:"47909", other_state:"IN", other_zip:"47909" },
                        { id:1, city:"Oakland", state:"CA", zip:"94612", other_state:"CA", other_zip:"94612" },
                        { id:2, city:"Arcata", state:"CA", zip:"95521", other_state:"CA", other_zip:"95521" },
                        { id:3, city:"Lafayette", state:"IN", zip:"47909", other_state:"IN", other_zip:"47909" },
                        { id:1, city:"Oakland", state:"CA", zip:"94612", other_state:"CA", other_zip:"94612" },
                        { id:2, city:"Arcata", state:"CA", zip:"95521", other_state:"CA", other_zip:"95521" },
                        { id:3, city:"Lafayette", state:"IN", zip:"47909", other_state:"IN", other_zip:"47909" },
                        { id:1, city:"Oakland", state:"CA", zip:"94612", other_state:"CA", other_zip:"94612" },
                        { id:2, city:"Arcata", state:"CA", zip:"95521", other_state:"CA", other_zip:"95521" },
                        { id:3, city:"Lafayette", state:"IN", zip:"47909", other_state:"IN", other_zip:"47909" },
                        { id:1, city:"Oakland", state:"CA", zip:"94612", other_state:"CA", other_zip:"94612" },
                        { id:2, city:"Arcata", state:"CA", zip:"95521", other_state:"CA", other_zip:"95521" },
                        { id:3, city:"Lafayette", state:"IN", zip:"47909", other_state:"IN", other_zip:"47909" },
                        { id:1, city:"Oakland", state:"CA", zip:"94612", other_state:"CA", other_zip:"94612" },
                        { id:2, city:"Arcata", state:"CA", zip:"95521", other_state:"CA", other_zip:"95521" },
                        { id:3, city:"Lafayette", state:"IN", zip:"47909", other_state:"IN", other_zip:"47909" }
                    ]
                }})
            }),

            "Visualization: BoxPlot" : new chorus.views.visualizations.Boxplot({
                model: new chorus.models.BoxplotTask({
                    xAxis: "test_coverage",
                    yAxis: "speed",
                    columns: [
                        { name: "bucket",        typeCategory: "STRING" },
                        { name: "min",           typeCategory: "REAL_NUMBER" },
                        { name: "median",        typeCategory: "REAL_NUMBER" },
                        { name: "max",           typeCategory: "REAL_NUMBER" },
                        { name: "firstQuartile", typeCategory: "REAL_NUMBER" },
                        { name: "thirdQuartile", typeCategory: "REAL_NUMBER" },
                        { name: "percentage",    typeCategory: "STRING" }
                    ],
                    rows: [
                        { bucket: 'january',  min: 1,  firstQuartile: 5,  median: 8, thirdQuartile: 12,  max: 25,  percentage: "20.999%" },
                        { bucket: 'february', min: 2, firstQuartile: 3, median: 5,  thirdQuartile: 7, max: 8, percentage: "40.3%" },
                        { bucket: 'march',    min: 10, firstQuartile: 10, median: 25,  thirdQuartile: 30, max: 35, percentage: "10.12" },
                        { bucket: 'april',    min: 2,  firstQuartile: 3,  median: 8,   thirdQuartile: 9,  max: 15, percentage: "30%" }
                    ]
                }),
                x: 'animal',
                y: 'value'
            }),

           "Visualization: Frequency Plot" : new chorus.views.visualizations.Frequency({
                model: new chorus.models.FrequencyTask({
                    columns: [
                        {name : "bucket", typeCategory: "STRING"},
                        {name : "count", typeCategory: "WHOLE_NUMBER"}
                    ],

                    rows: [
                        { bucket: "Twenty", count: 20 },
                        { bucket: "Eight", count: 8 },
                        { bucket: "Five", count: 5 },
                        { bucket: "One", count: 1 },
                        { bucket: "Zero", count: 0 }
                    ],
                    "chart[yAxis]": "Custom y Axis Title"
                })
            }),


            "Visualization: HistogramPlot" : new chorus.views.visualizations.Histogram({
                model: new chorus.models.HistogramTask({
                    columns: [
                        {name : "bin", typeCategory: "STRING"},
                        {name : "frequency", typeCategory: "WHOLE_NUMBER"}
                    ],

                    rows: [
                        { bin: "Five", frequency: 5 },
                        { bin: "Eight", frequency: 8 },
                        { bin: "Zero", frequency: 0 },
                        { bin: "One", frequency: 1 },
                        { bin: "Twenty", frequency: 20 }
                    ],
                    "chart[xAxis]": "Custom x Axis Title"
                })
            }),

            "Visualization: Heatmap" : new chorus.views.visualizations.Heatmap({
                model: new chorus.models.HistogramTask({
                    xAxis: "brutality",
                    yAxis: "victory_points",
                    columns: [
                        { "name": "x",      "typeCategory": "WHOLE_NUMBER" },
                        { "name": "y",      "typeCategory": "WHOLE_NUMBER" },
                        { "name": "value",  "typeCategory": "REAL_NUMBER" },
                        { "name": "xLabel", "typeCategory": "STRING" },
                        { "name": "yLabel", "typeCategory": "STRING" }
                    ],

                    rows: [
                        { yLabel: "[30-71.8]",     xLabel: "[00000000-1.8111100]",   value: 39541, y: 1, x: 1 },
                        { yLabel: "[71.8-113.6]",  xLabel: "[00000000-1.8111100]",   value: 39873, y: 2, x: 1 },
                        { yLabel: "[113.6-155.4]", xLabel: "[00000000-1.8111100]",   value: 39993, y: 3, x: 1 },
                        { yLabel: "[155.4-197.2]", xLabel: "[00000000-1.8111100]",   value: 39596, y: 4, x: 1 },
                        { yLabel: "[30-71.8]",     xLabel: "[1.8-3.6000]", value: 39818, y: 1, x: 2 },
                        { yLabel: "[71.8-113.6]",  xLabel: "[1.8-3.6000]", value: 39838, y: 2, x: 2 },
                        { yLabel: "[113.6-155.4]", xLabel: "[1.8-3.6000]", value: 39911, y: 3, x: 2 },
                        { yLabel: "[155.4-197.2]", xLabel: "[1.8-3.6000]", value: 40757, y: 4, x: 2 },
                        { yLabel: "[30-71.8]",     xLabel: "[3.6-5.40000011110]", value: 39631, y: 1, x: 3 },
                        { yLabel: "[71.8-113.6]",  xLabel: "[3.6-5.40000011110]", value: 40174, y: 2, x: 3 },
                        { yLabel: "[113.6-155.4]", xLabel: "[3.6-5.40000011110]", value: 39700, y: 3, x: 3 },
                        { yLabel: "[155.4-197.2]", xLabel: "[3.6-5.40000011110]", value: 40084, y: 4, x: 3 },
                        { yLabel: "[30-71.8]",     xLabel: "[5.4-7.20000011110]", value: 40551, y: 1, x: 4 },
                        { yLabel: "[71.8-113.6]",  xLabel: "[5.4-7.20000011110]", value: 40411, y: 2, x: 4 },
                        { yLabel: "[113.6-155.4]", xLabel: "[5.4-7.20000011110]", value: 39841, y: 3, x: 4 },
                        { yLabel: "[155.4-197.2]", xLabel: "[5.4-7.20000011110]", value: 40359, y: 4, x: 4 }
                    ]
                })
            }),

            "Visualization: Timeseries" : new chorus.views.visualizations.Timeseries({
                model: new chorus.models.TimeseriesTask({
                    columns: [
                        {name : "time", typeCategory: "DATE"},
                        {name : "value", typeCategory: "WHOLE_NUMBER"}
                    ],

                    rows: [
                        { time: '2010-01-01', value: 321 },
                        { time: '2010-02-01', value: 124 },
                        { time: '2011-03-01', value: 321 },
                        { time: '2011-04-01', value: 321 },
                        { time: '2011-05-01', value: 421 },
                        { time: '2012-06-01', value: 621 },
                        { time: '2012-07-01', value: 524 },
                        { time: '2012-08-01', value: 824 },
                        { time: '2012-09-01', value: 924 },
                        { time: '2012-09-02', value: 926 },
                        { time: '2012-09-03', value: 927 },
                        { time: '2012-09-04', value: 124 },
                        { time: '2012-09-05', value: 224 },
                        { time: '2012-09-06', value: 924 },
                        { time: '2012-09-07', value: 524 },
                        { time: '2012-09-08', value: 924 },
                        { time: '2012-10-01', value: 724 }
                    ],
                    xAxis: "Day of the Week",
                    yAxis: "Parties",
                    timeType: "date"
                })
            })

        }
    },

    render : function(){
        $(this.el).empty()

        var self = this;
        _.each(this.views, function(view, name) {
            $(self.el).append("<li class='view'><h1>" + name + "</h1><div class='view_guts'/></li>")
            view.el = self.$(".view_guts:last")[0];
            view.delegateEvents();
            view.render();
        })

        return this
    }
});
