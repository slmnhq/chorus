require 'spec_helper'

describe Schema do
  context "#from_instance_account" do
    it "should retrieve all schemas for a database" do
      instance = FactoryGirl.create(:instance)
      instance_account = FactoryGirl.create(:instance_account, :instance_id => instance.id)

      query = "select count(*) as datasetCount ,nspname from pg_namespace n, pg_tables t WHERE nspname NOT LIKE 'pg_%' AND nspname NOT IN('information_schema','gp_toolkit', 'gpperfmon') and n.nspname = t.schemaname group by t.schemaname , n.nspname"
      stub_gpdb(instance_account, query => [["50", "schema1"]])

      schemas = Schema.from_instance_account_and_db(instance_account, "test2")
      schemas.first.should be_a(Schema)
      schemas.first.name.should == "schema1"
      schemas.first.dataset_count.should == 50
    end
  end
end
