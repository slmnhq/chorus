describe("WorkspaceDelete", function() {
    beforeEach(function() {
        this.launchElement = $("<a></a>")
        this.model = new chorus.models.Workspace({ name: "Friends' Writings", id: '34' });
        this.alert = new chorus.alerts.WorkspaceDelete({ launchElement : this.launchElement, pageModel : this.model });
        this.loadTemplate("alert")
    });

    it("does not re-render when the model changes", function() {
        expect(this.alert.persistent).toBeTruthy();
    })

    it("has the correct title", function() {
        expect(this.alert.title).toBe(t("workspace.delete.title", "Friends' Writings"))
    })

    it("has the correct text", function() {
        expect(this.alert.text).toBe(t("workspace.delete.text"))
    })

    describe("when the workspace deletion is successful", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
            spyOn($, 'jGrowl');
            spyOnEvent($(document), "close.facebox");
            this.alert.model.trigger("destroy", this.alert.model);
        })

        it("displays a toast message", function() {
            expect($.jGrowl).toHaveBeenCalledWith(t("workspace.delete.toast", this.model.get("name")), {
                sticky : false,
                life : 5000
            });
        })

        it("navigates to the dashboard", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith("/", true);
        });
    })
})
