describe("chorus.alerts.WorkfileVersionDelete", function() {
    beforeEach(function() {
        this.workfile = rspecFixtures.workfile.sql();
        this.alert = new chorus.alerts.WorkfileVersionDelete({ versionNumber: 10, pageModel: this.workfile });
        stubModals();
        this.alert.launchModal();
    });

    it("does not re-render when the model changes", function() {
        expect(this.alert.persistent).toBeTruthy();
    });

    it("has the correct title", function() {
        expect(this.alert.title).toBe(t("workfile_version.alert.delete.title", {version: "10"}));
    });

    it("has the button text", function() {
        expect(this.alert.ok).toBe(t("workfile_version.alert.delete.ok"));
    });

    it("has the correct text", function() {
        expect(this.alert.text).toBe(t("workfile_version.alert.delete.text"));
    });

    it("has the correct deleteMessage", function() {
        expect(this.alert.deleteMessage).toBe("workfile_version.alert.delete.success");
    });

    it("has the correct version as the model", function() {
        expect(this.alert.model).toBeA(chorus.models.WorkfileVersion);
        expect(this.alert.model.get("workspaceId")).toEqual(this.workfile.get("workspaceId"));
        expect(this.alert.model.get("id")).toEqual(this.workfile.id);
        expect(this.alert.model.get("versionInfo").versionNum).toEqual(10);
    });

    it("does not update the pageModel", function() {
        expect(this.workfile.get("versionInfo").versionNum).not.toBe(10);
    });
});
