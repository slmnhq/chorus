require 'spec_helper'

describe GpdbDatabase do
  context "#refresh" do
    let(:instance) { FactoryGirl.build(:instance, :id => 123) }
    let(:account) { FactoryGirl.build(:instance_account, :instance => instance) }

    before(:each) do
      stub_gpdb(account,
        "select datname from pg_database order by upper(datname)" => [
          ["db_a"], ["db_B"], ["db_C"], ["db_d"]
        ]
      )
    end

    it "creates new copies of the databases in our db" do
      @databases = GpdbDatabase.refresh(account)

      @databases.length.should == 4
      @databases.map {|db| db.name }.should == ["db_a", "db_B", "db_C", "db_d"]
      @databases.map {|db| db.instance_id }.should == [123, 123, 123, 123]
    end

    it "does not re-create databases that already exist in our database" do
      @databases = GpdbDatabase.refresh(account)
      @databases = GpdbDatabase.refresh(account)

      @databases.length.should == 4
      @databases.map {|db| db.name }.should == ["db_a", "db_B", "db_C", "db_d"]
      @databases.map {|db| db.instance_id }.should == [123, 123, 123, 123]
    end

    it "destroy databases that no longer exist in gpdb" do
      stub_gpdb(account,
        "select datname from pg_database order by upper(datname)" => [
          ["db_a"], ["db_B"]
        ]
      )

      @databases = GpdbDatabase.refresh(account)

      @databases.length.should == 2
      @databases.map {|db| db.name }.should == ["db_a", "db_B"]
      @databases.map {|db| db.instance_id }.should == [123, 123]
    end
  end
end
