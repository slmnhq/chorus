require 'spec_helper'

describe GpdbDatabase do
  context "#refresh" do
    let(:instance) { FactoryGirl.create(:instance) }
    let(:account) { FactoryGirl.create(:instance_account, :instance => instance) }

    before(:each) do
      stub_gpdb(account,
        GpdbDatabase::DATABASE_NAMES_SQL => [
          {"datname" => "db_a"}, {"datname" => "db_B"}, {"datname" => "db_C"}, {"datname" => "db_d"}
        ]
      )
    end

    it "creates new copies of the databases in our db" do
      GpdbDatabase.refresh(account)

      databases = instance.databases

      databases.length.should == 4
      databases.map {|db| db.name }.should =~ ["db_a", "db_B", "db_C", "db_d"]
      databases.map {|db| db.instance_id }.uniq.should == [instance.id]
    end

    it "does not re-create databases that already exist in our database" do
      GpdbDatabase.refresh(account)
      expect { GpdbDatabase.refresh(account) }.not_to change(GpdbDatabase, :count)
    end
  end

  context "association" do
    it { should have_many :schemas }
  end
end
