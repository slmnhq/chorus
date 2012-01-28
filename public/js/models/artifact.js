chorus.models.Artifact = chorus.models.Base.extend({
    downloadUrl:function () {
        return "/edc/file/" + this.get("id");
    }
});