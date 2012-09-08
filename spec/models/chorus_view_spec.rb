require "spec_helper"

describe ChorusView do
  let(:schema) { gpdb_schemas(:bobs_schema) }
  let(:account) { instance_accounts(:bobo) }

  describe "#query" do
    let(:query) { "select 1;" }
    let(:resultSet) { [{}] }
    before do
      stub_gpdb(account, "EXPLAIN #{query}" => resultSet)
    end

    context "with invalid query" do
      it "should raise error when having invalid query" do
        any_instance_of(GpdbSchema) do |schema|
          mock(schema).with_gpdb_connection.with_any_args { raise ActiveRecord::StatementInvalid }
        end

        expect { described_class.create!({:name => "invalid_query", :schema => schema,
                                          :query => "select * from some_table"}, :without_protection => true) }.to raise_error(ActiveRecord::StatementInvalid)
      end

      it "should start with select or with" do
        expect { described_class.create!({:name => "invalid_query", :schema => schema,
                                          :query => "this is not a query"}, :without_protection => true) }.to raise_error(ActiveRecord::StatementInvalid)
      end
    end

    context "with a multi-statement query" do
      let(:query) { "select 1; select 2;" }
      let(:resultSet) do
        [[{"QUERY PATH" => "something"}], [{"QUERY PATH" => "something"}]]
      end
      it "should raise error" do
        expect { described_class.create!({:name => "invalid_query", :schema => schema,
                                          :query => query}, :without_protection => true) }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "with valid query" do
      let(:query) { "select 1;" }
      let(:resultSet) do
        [{"QUERY PATH" => "something", "foo" => "bar"}]
      end

      context "a query that starts with 'WITH'" do
        let(:query) { "With a" }
        it "should not return error" do
          chorus_view = ChorusView.create!({:name => "query", :schema => schema, :query => query}, :without_protection => true)
          chorus_view.query.should == query
        end
      end

      context "a querhy that starts with 'SELECT'" do
        let(:query) { "selecT 1;" }
        it "should not return error" do
          chorus_view = ChorusView.create!({:name => "query", :schema => schema, :query => query}, :without_protection => true)
          chorus_view.query.should == query
        end
      end


      it "should only return ChorusView" do
        count = Dataset.chorus_views("chorus_view_name").count
        ChorusView.create!({:name => "chorus_view_name", :schema => schema, :query => query }, :without_protection => true)
        Dataset.chorus_views("chorus_view_name").count.should == count + 1
      end
    end
  end
end
