require 'spec_helper'

describe Database do
  context "#from_instance_account" do
    it "returns all the databases on the connection" do
      instance = FactoryGirl.build(:instance, :id => 123)
      account = FactoryGirl.build(:instance_account, :instance => instance)

      stub_gpdb(account,
        "select datname from pg_database order by upper(datname)" => [
          ["db_a"], ["db_B"], ["db_C"], ["db_d"]
        ]
      )

      databases = Database.from_instance_account(account)

      databases.length.should == 4
      databases.map {|db| db.name }.should == ["db_a", "db_B", "db_C", "db_d"]
      databases.map {|db| db.instance_id }.should == [123, 123, 123, 123]
    end
  end
end
