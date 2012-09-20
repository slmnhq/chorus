describe("chorus.alerts.ImportScheduleDelete", function() {
    beforeEach(function() {
        this.dataset = rspecFixtures.workspaceDataset.datasetTable()
        this.dataset.setImport(rspecFixtures.importSchedule());
        setLoggedInUser({ id: "1011" });
        this.import = this.dataset.getImport();
        this.alert = new chorus.alerts.ImportScheduleDelete({ pageModel: this.dataset });
    });

    it("does not have a redirect url", function() {
        expect(this.alert.redirectUrl).toBeUndefined();
    });

    describe("#makeModel", function() {
        it("gets the current user's account for the instance that is the current page model", function(){
            expect(this.alert.model.get("datasetId")).toBe(this.import.get("datasetId"));
        });
    });

    describe("successful deletion", function() {
        beforeEach(function() {
            spyOn(chorus, "toast");
            this.changeSpy = jasmine.createSpy("change");
            this.alert.pageModel.bind("change", this.changeSpy, this);
            this.alert.model.trigger("destroy", this.alert.model);
        });

        it("displays a toast message", function() {
            expect(chorus.toast).toHaveBeenCalledWith("import.schedule.delete.toast", undefined);
            expect(chorus.toast.callCount).toBe(1);
        });

        it("deletes the id of the model and triggers change on the page model", function() {
            expect(this.changeSpy).toHaveBeenCalled();
            expect(this.alert.model.id).toBeUndefined();
        });
    });
});
