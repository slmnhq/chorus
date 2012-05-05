require 'spec_helper'

describe Database do
  context "#from_instance_account" do
    it "returns all the databases on the connection" do
      fakeInstanceAccount = Object.new
      stub(fakeInstanceAccount).instance_id {
        12345
      }
      stub(fakeInstanceAccount).make_connection {
        fakeConnection = Object.new
        stub(fakeConnection).query("select datname from pg_database") {
          [["test"],["test"],["test"],["test"]]
        }
        fakeConnection
      }

      databases = Database.from_instance_account(fakeInstanceAccount)
      databases.length.should == 4
      databases[0].name.should == "test"
      databases[0].instance_id.should == 12345
    end
  end
end