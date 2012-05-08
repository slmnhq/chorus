require 'spec_helper'

describe Schema do
  context "#from_instance_account" do
    it "should retrieve all schemas for a database" do
      instance = FactoryGirl.create(:instance)
      instanceAccount = FactoryGirl.create(:instance_account, :instance_id => instance.id)

      stub(Gpdb::ConnectionBuilder).make_connection_with_database_name(instance, instanceAccount, "test2") {
        fakeConnection = Object.new
        stub(fakeConnection).query("select count(*) as datasetCount ,nspname from pg_namespace n, pg_tables t WHERE nspname NOT LIKE 'pg_%' AND nspname NOT IN('information_schema','gp_toolkit', 'gpperfmon') and n.nspname = t.schemaname group by t.schemaname , n.nspname") {
          [["50", "schema1"]]
        }
        fakeConnection
      }

      schemas = Schema.from_instance_account_and_db(instanceAccount, "test2")
      schemas.first.should be_a(Schema)
      schemas.first.name.should == "schema1"
      schemas.first.dataset_count.should == 50
    end
  end
end