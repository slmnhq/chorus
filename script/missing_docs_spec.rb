require './script/missing_docs'

describe "missing docs script" do
  context "#remove_plurals" do
    it "removes duplicates" do
      list = ["workspace", "workspaces"]
      remove_plurals(list).should == ["workspace"]
    end

    it "keeps singles, but chops off the s" do
      list = ["workspaces"]
      remove_plurals(list).should == ["workspace"]
    end
  end

  context "#find_missing" do
    it "finds the missing docs" do
      routes = ["workspace", "workspaces", "other"]
      existing_docs = ["workspaces"]
      find_missing(routes, existing_docs).should == ["other"]
    end
  end
end
