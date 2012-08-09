require 'spec_helper'

describe GpdbDatabase do
  context "#refresh" do
    let(:instance) { FactoryGirl.create(:instance) }
    let(:account) { FactoryGirl.create(:instance_account, :instance => instance) }

    before(:each) do
      stub_git (account,
                GpdbDatabase::DATABASE_NAMES_SQL => [
                    {"datname" => "db_a"}, {"datname" => "db_B"}, {"datname" => "db_C"}, {"datname" => "db_d"}
                ]
      )
    end

    it "creates new copies of the databases in our db" do
      GpdbDatabase.refresh(account)

      databases = instance.databases

      databases.length.should == 4
      databases.map { |db| db.name }.should =~ ["db_a", "db_B", "db_C", "db_d"]
      databases.map { |db| db.instance_id }.uniq.should == [instance.id]
    end

    it "does not re-create databases that already exist in our database" do
      GpdbDatabase.refresh(account)
      expect { GpdbDatabase.refresh(account) }.not_to change(GpdbDatabase, :count)
    end

    context "when database objects are stale" do
      before do
        GpdbDatabase.all.each { |database|
          database.mark_stale!
        }
      end

      it "marks them as non-stale" do
        GpdbDatabase.refresh(account)
        account.instance.databases.each { |database|
          database.reload.should_not be_stale
        }
      end
    end
  end

  context "association" do
    it { should have_many :schemas }
  end

  describe "callbacks" do
    let(:database) { gpdb_databases(:bobs_database) }

    describe "before_save" do
      describe "#mark_schemas_as_stale" do
        it "if the database has become stale, schemas will also be marked as stale" do
          database.update_attributes!({:stale_at => Time.now}, :without_protection => true)
          schema = database.schemas.first
          schema.should be_stale
          schema.stale_at.should be_within(5.seconds).of(Time.now)
        end
      end
    end
  end
end
