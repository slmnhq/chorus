require 'spec_helper'

describe ColumnController do
  let(:user) { FactoryGirl.create :user}

  before do
    log_in user
  end

  context "#index" do
     let(:instance) { FactoryGirl.create(:instance, :owner_id => user.id) }
     let(:instanceAccount) { FactoryGirl.create(:instance_account, :instance_id => instance.id, :owner_id => user.id) }

     let(:database) { FactoryGirl.create(:gpdb_database, :instance => instance, :name => "database1") }
     let(:schema) { FactoryGirl.create(:gpdb_schema, :name => 'schema1', :database => database) }
     let!(:table) { FactoryGirl.create(:gpdb_table, :name => 'table1', :schema => schema) }

     before do
       mock(GpdbColumn).columns_for(instanceAccount, database.name, "\"#{schema.name}\".\"#{table.name}\"") do
               [
                   GpdbColumn.new(:name =>'email', :data_type => 'varchar(255)', :description =>'it must be present'),
                   GpdbColumn.new(:name =>'age', :data_type => 'integer', :description =>'nothing'),
               ]
         end
     end

     it "should retrieve column for a table" do
       get :index, :database_object_id => table.to_param

       response.code.should == "200"
       decoded_response.length.should == 2
     end
   end
 end
