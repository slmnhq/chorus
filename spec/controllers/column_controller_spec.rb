require 'spec_helper'

describe ColumnController do
  ignore_authorization!

  let(:user) { FactoryGirl.create :user }

  before do
    log_in user
  end

  context "#index" do
    let!(:table) { FactoryGirl.create(:gpdb_table) }

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
      mock(subject).authorize! :show_contents, table.instance
      get :index, :dataset_id => table.to_param
    end

    it "should retrieve column for a table" do
      get :index, :dataset_id => table.to_param

      response.code.should == "200"
      decoded_response.length.should == 2
    end
  end
end
