describe("chorus.alerts.DatasetDelete", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-key-prefix='delete'></a>")
        this.model = fixtures.datasetChorusView();
        this.alert = new chorus.alerts.DatasetDelete({ launchElement : this.launchElement, pageModel : this.model });
        stubModals();
        this.alert.launchModal();
    });

    it("does not re-render when the model changes", function() {
        expect(this.alert.persistent).toBeTruthy();
    })

    it("has the correct title", function() {
        expect(this.alert.title).toBe(t("dataset.delete.title", this.model.name()))
    })

    it("has the correct text", function() {
        expect(this.alert.text).toBe(t("dataset.delete.text"))
    })

    describe("when the alert closes", function() {
        beforeEach(function() {
            this.alert.render();
            this.alert.$("button.cancel").click();
            spyOn(chorus.router, "navigate");
            spyOn(chorus, 'toast');
        });

        it("unbinds event handlers on the model", function() {
            this.model.trigger("destroy");
            expect(chorus.toast).not.toHaveBeenCalled();
            expect(chorus.router.navigate).not.toHaveBeenCalled();
        });
    });

    describe("when the dataset deletion is successful", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
            spyOn(chorus, 'toast');
            this.name = this.model.name();
            this.alert.model.destroy();
            this.server.lastDestroy().succeed();
        });

        it("displays a toast message", function() {
            expect(chorus.toast).toHaveBeenCalledWith("dataset.delete.toast", {datasetName: this.name});
        });

        it("navigates to the dataset list page", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith("#/workspaces/" + this.alert.model.get('workspace').id + "/datasets");
        });
    })
})
