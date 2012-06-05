require 'spec_helper'

describe GpdbColumn do
  describe ".columns_for" do
    let(:instance) { stub(Object.new).subject }
    let(:account) do
      stub(Object.new).instance { instance }.subject
    end

    subject { GpdbColumn.columns_for(account, 'database_name', 'table_name') }

    before do
      mock(Gpdb::ConnectionBuilder).connect!(instance, account, 'database_name') do
        [
          ['email', 'varchar(255)', 'it must be present', 1],
          ['age', 'integer', 'nothing awesome', 2],
        ]
      end
    end

    it "returns a collections of columns" do
      subject.should have(2).columns
    end

    it "gets column name, column type and column comment" do
      first_column = subject.first
      first_column.name.should eq("email")
      first_column.data_type.should eq("varchar(255)")
      first_column.description.should eq("it must be present")
      first_column.ordinal_position.should eq(1)
    end
  end

  describe ".columns_for integration" do
    let(:db_config) do
      Rails.configuration.database_configuration['test']
    end

    let(:account) do 
      FactoryGirl.create(:instance_account, {
        :db_username => db_config['username'],
        :db_password => 'something',
        :instance => instance
      })
    end

    let(:instance) do
      FactoryGirl.create(:instance, {
        :host => db_config['host'],
        :port => db_config['port']
      })
    end

    subject { GpdbColumn.columns_for(account, db_config['database'], 'users') }

    # XXX Local databases usually don't have password so bypass validation
    before do
      account.update_attribute :db_password, db_config['password']
    end
    
    it "gets the column information for table users" do
      id = subject.first

      id.name.should eq('id')
      id.data_type.should eq('integer')
      id.description.should be_blank
    end
  end
end
