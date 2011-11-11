(function($, ns) {
    ns.RouteSplat = chorus.views.Base.extend({
        className : "routes",
       
        context : function() {
            var routes = _.clone(chorus.router.maps)
            routes.shift()
            return {routes : _.map(routes, function(map){
                return {url : map[0], className : map[1]};
            })};
        }
    });
})(jQuery, chorus.views);
