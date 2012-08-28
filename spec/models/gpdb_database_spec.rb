require 'spec_helper'

describe GpdbDatabase do
  context "#refresh" do
    let(:instance) { FactoryGirl.create(:instance) }
    let(:account) { FactoryGirl.create(:instance_account, :instance => instance) }

    before(:each) do
      stub_gpdb(account, GpdbDatabase::DATABASE_NAMES_SQL => [
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

  describe ".create_schema" do
    context "using a real greenplum instance", :database_integration => true do
      let(:account) { GpdbIntegration.real_gpdb_account }
      let(:database) { GpdbDatabase.find_by_name_and_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)}
      let(:instance) { database.instance }

      before do
        refresh_chorus
      end

      after do
        exec_on_gpdb('DROP SCHEMA IF EXISTS "my_new_schema"')
      end

      it "creates the schema" do

        database.create_schema("my_new_schema", account.owner).tap do |schema|
          schema.name.should == "my_new_schema"
          schema.database.should == database
        end

        database.schemas.find_by_name("my_new_schema").should_not be_nil

        exec_on_gpdb("select * from pg_namespace where nspname = 'my_new_schema';") do |result|
          result[0]["nspname"].should == "my_new_schema"
        end
      end

      it "raises an error if a schema with the same name already exists" do
        expect {
          database.create_schema(database.schemas.last.name, account.owner)
        }.to raise_error(ActiveRecord::StatementInvalid) { |exception|
          exception.message.should match("already exists")
        }
      end

      def exec_on_gpdb(sql)
        Gpdb::ConnectionBuilder.connect!(instance, account, database.name) do |connection|
          result = connection.exec_query(sql)
          block_given? ? yield(result) : result
        end
      end
    end

    context "when gpdb connection is broken" do
      let(:database) { gpdb_databases(:bobs_database) }
      let(:user) { users(:bob) }

      before do
        stub(Gpdb::ConnectionBuilder).connect!.with_any_args { raise ActiveRecord::JDBCError.new('quack') }
      end

      it "raises an error" do
        expect {
          database.create_schema("test_schema", user) }.to raise_error(ActiveRecord::JDBCError) { |exception|
          exception.message.should match("quack")
        }
      end

      it "does not create a local database" do
        expect {
          database.create_schema("my_new_schema", user)
        }.to raise_error(ActiveRecord::JDBCError)
        database.schemas.find_by_name("my_new_schema").should be_nil
      end
    end
  end
end
