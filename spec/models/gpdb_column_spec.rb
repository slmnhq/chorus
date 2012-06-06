require 'spec_helper'

describe GpdbColumn do
  describe ".columns_for" do
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

    let(:database) { FactoryGirl.create(:gpdb_database, :name => "chorus_rails_test", :instance => instance)}
    let(:schema) { FactoryGirl.create(:gpdb_schema, :name => "public", :database => database)}
    let(:database_object) { FactoryGirl.create(:gpdb_table, :schema => schema, :name => "users") }

    subject { GpdbColumn.columns_for(account, database_object) }

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

    describe "with fake data" do
      before do
        mock(Gpdb::ConnectionBuilder).connect!(instance, account, 'chorus_rails_test') do
          [
            ['email', 'varchar(255)', 'it must be present', 1],
            ['age', 'integer', 'nothing awesome', 2],
          ]
        end
      end

      it "returns a collections of columns" do
        subject.should have(2).columns
      end

      it "gets column comment and column position" do
        first_column = subject.first
        first_column.description.should eq("it must be present")
        first_column.ordinal_position.should eq(1)
      end
    end
  end
end
