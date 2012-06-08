require 'spec_helper'

describe GpdbDatabase do
  context "#refresh" do
    let(:instance) { FactoryGirl.create(:instance) }
    let(:account) { FactoryGirl.create(:instance_account, :instance => instance) }

    before(:each) do
      stub_gpdb(account,
        GpdbDatabase::DATABASE_NAMES_SQL => [
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
      databases.map {|db| db.instance_id }.uniq.should == [instance.id]
    end

    it "does not re-create databases that already exist in our database" do
      GpdbDatabase.refresh(account)
      GpdbDatabase.refresh(account)

      GpdbDatabase.count.should == 4
    end

    it "destroy databases that no longer exist in gpdb" do
      GpdbDatabase.refresh(account)

      stub_gpdb(account,
        GpdbDatabase::DATABASE_NAMES_SQL => [
          ["db_a"], ["db_B"]
        ]
      )

      GpdbDatabase.refresh(account)
      databases = GpdbDatabase.all

      databases.length.should == 2
      databases.map {|db| db.name }.should == ["db_a", "db_B"]
      databases.map {|db| db.instance_id }.uniq.should == [instance.id]
    end

    it "does not destroy databases on other instances" do
      other_account = FactoryGirl.create(:instance_account)
      stub_gpdb(other_account,
        GpdbDatabase::DATABASE_NAMES_SQL => [ ["different"], ["matching"] ]
      )
      stub_gpdb(account,
        GpdbDatabase::DATABASE_NAMES_SQL => [ ["matching"] ]
      )

      GpdbDatabase.refresh(other_account)

      lambda {
        GpdbDatabase.refresh(account)
      }.should_not change {
        other_account.reload.instance.databases.count
      }
    end
  end

  context "association" do
    it { should have_many :schemas }
  end
end
