require 'spec_helper'

describe ColumnController do
  ignore_authorization!

  before do
    log_in user
  end

  context "#index" do
    context "with mock data" do
      let(:user) { users(:no_collaborators) }
      let!(:table) { datasets(:bobs_table) }

      before do
        fake_account = Object.new
        stub(subject).gpdb_account_for_current_user(table) { fake_account }
        stub(GpdbColumn).columns_for(fake_account, table) do
          [
              GpdbColumn.new(:name => 'email', :data_type => 'varchar(255)', :description => 'it must be present'),
              GpdbColumn.new(:name => 'age', :data_type => 'integer', :description => 'nothing'),
          ]
        end
      end

      it "should check for permissions" do
        mock(subject).authorize! :show_contents, table.gpdb_instance
        get :index, :dataset_id => table.to_param
      end

      it "should retrieve column for a table" do
        get :index, :dataset_id => table.to_param

        response.code.should == "200"
        decoded_response.length.should == 2
      end
    end

    context "with real data" do
      let(:account) { GpdbIntegration.real_gpdb_account }
      let(:user) { account.owner }

      generate_fixture "databaseColumnSet.json" do
        database = GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)
        dataset = database.find_dataset_in_schema('base_table1', 'test_schema')
        dataset.analyze(account)
        get :index, :dataset_id => dataset.to_param
      end
    end
  end
end
