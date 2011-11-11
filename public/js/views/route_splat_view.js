(function($, ns) {
    ns.RouteSplat = chorus.views.Base.extend({
        className : "routes",
       
        context : function() {
            return {routes : _.map(chorus.router.maps, function(map){
                return {url : map[0], className : map[1]};
            })};
        }
    });
})(jQuery, chorus.views);
