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

    let(:database) { FactoryGirl.create(:gpdb_database, :name => "chorus_rails_test", :instance => instance) }
    let(:schema) { FactoryGirl.create(:gpdb_schema, :name => "public", :database => database) }
    let(:dataset) { FactoryGirl.create(:gpdb_table, :schema => schema, :name => "users") }

    subject { GpdbColumn.columns_for(account, dataset) }

    # XXX Local databases usually don't have password so bypass validation
    before do
      account.update_attribute :db_password, db_config['password']
    end

    it "gets the column information for table users" do
      id = subject.first

      id.name.should eq('id')
      id.data_type.should eq('integer')
      id.description.should be_blank
      id.ordinal_position.should eq("1")
    end

    it "gets the column stats for table users" do
      id = subject.first

      id.statistics.should be_a GpdbColumnStatistics
    end

    describe "with fake data" do
      before do
        mock(Gpdb::ConnectionBuilder).connect!(instance, account, 'chorus_rails_test') do
          [
            ['email', 'varchar(255)', 'it must be present', 1, '1stats1', '1stats2', '1stats3', '1stats4', '1stats5', '1rows1'],
            ['age', 'integer', 'nothing awesome', 2, '2stats1', '2stats2', '2stats3', '2stats4', '2stats5', '2rows1'],
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

      it "initializes column stats with correct parameters" do
        mock(GpdbColumnStatistics).new('1stats1', '1stats2', '1stats3', '1stats4', '1stats5', '1rows1', false) { }
        mock(GpdbColumnStatistics).new('2stats1', '2stats2', '2stats3', '2stats4', '2stats5', '2rows1', true) { }
        subject
      end

      it "associates column stats objects with their column" do
        fake_stats = Object.new
        stub(GpdbColumnStatistics).new { fake_stats }
        subject.first.statistics.should be fake_stats
      end
    end
  end

  describe "#number_or_time?" do
    it "is true if it is a numeric column" do
      GpdbColumn.new(:data_type => "integer").should be_number_or_time
      GpdbColumn.new(:data_type => "numeric").should be_number_or_time
      GpdbColumn.new(:data_type => "double precision").should be_number_or_time
    end

    it "is true if it is a time column" do
      GpdbColumn.new(:data_type => "date").should be_number_or_time
      GpdbColumn.new(:data_type => "time with time zone").should be_number_or_time
      GpdbColumn.new(:data_type => "timestamp with time zone").should be_number_or_time
    end

    it "is false otherwise" do
      GpdbColumn.new(:data_type => "text").should_not be_number_or_time
    end
  end

  describe "#simplified_type" do
    subject { GpdbColumn.new(:data_type => type_string) }

    def self.it_simplifies_type(type, simplified_type)
      context "with a '#{type}' column" do
        let(:type_string) { type }
        its(:simplified_type) { should == simplified_type }
      end
    end

    it_simplifies_type("complex", nil)
    it_simplifies_type("numeric", :decimal)
    it_simplifies_type("integer[]", :string)
    it_simplifies_type("bigint", :integer)
    it_simplifies_type("bit(5)", :string)
    it_simplifies_type("bit varying(10)", :string)
    it_simplifies_type("boolean", :boolean)
    it_simplifies_type("box", :string)
    it_simplifies_type("bytea", :binary)
    it_simplifies_type("character varying(10)", :string)
    it_simplifies_type("character(10)", :string)
    it_simplifies_type("cidr", :string)
    it_simplifies_type("circle", :string)
    it_simplifies_type("date", :date)
    it_simplifies_type("double precision", :float)
    it_simplifies_type("inet", :string)
    it_simplifies_type("integer", :integer)
    it_simplifies_type("interval", :string)
    it_simplifies_type("lseg", :string)
    it_simplifies_type("macaddr", :string)
    it_simplifies_type("money", :decimal)
    it_simplifies_type("numeric(5,5)", :decimal)
    it_simplifies_type("path", :string)
    it_simplifies_type("point", :string)
    it_simplifies_type("polygon", :string)
    it_simplifies_type("real", :float)
    it_simplifies_type("smallint", :integer)
    it_simplifies_type("text", :text)
    it_simplifies_type("time without time zone", :time)
    it_simplifies_type("time with time zone", :time)
    it_simplifies_type("timestamp without time zone", :datetime)
    it_simplifies_type("timestamp with time zone", :datetime)
  end
end
