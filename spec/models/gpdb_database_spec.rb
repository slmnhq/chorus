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
      databases = GpdbDatabase.refresh(account)

      GpdbDatabase.refresh(account)
      databases = GpdbDatabase.all

      databases.length.should == 4
      databases.map {|db| db.name }.should == ["db_a", "db_B", "db_C", "db_d"]
      databases.map {|db| db.instance_id }.should == [123, 123, 123, 123]
    end

    it "does not re-create databases that already exist in our database" do
      GpdbDatabase.refresh(account)
      GpdbDatabase.refresh(account)

      GpdbDatabase.count.should == 4
    end

    it "destroy databases that no longer exist in gpdb" do
      GpdbDatabase.refresh(account)

      stub_gpdb(account,
        "select datname from pg_database order by upper(datname)" => [
          ["db_a"], ["db_B"]
        ]
      )

      GpdbDatabase.refresh(account)
      databases = GpdbDatabase.all

      databases.length.should == 2
      databases.map {|db| db.name }.should == ["db_a", "db_B"]
      databases.map {|db| db.instance_id }.should == [123, 123]
    end

    it "does not destroy database on other instances" do
      other_account = FactoryGirl.create(:instance_account)
      stub_gpdb(other_account,
        "select datname from pg_database order by upper(datname)" => [
          ["different"], ["matching"]
        ]
      )
      GpdbDatabase.refresh(other_account)

      stub_gpdb(account,
        "select datname from pg_database order by upper(datname)" => [
          ["matching"]
        ]
      )
      GpdbDatabase.refresh(account)

      other_account.reload.instance.databases.count.should == 2
    end
  end
end
