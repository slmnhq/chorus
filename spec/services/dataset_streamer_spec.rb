require 'spec_helper'

describe DatasetStreamer do
  let(:dataset) { datasets(:bobs_table) }
  let(:user) { users(:bob) }
  let(:account) { instance_accounts(:bobo) }

  describe "#initialize" do
    it "takes a dataset and user" do
      streamer = DatasetStreamer.new(dataset, user)
      streamer.user.should == user
      streamer.dataset.should == dataset
    end
  end

  describe "#enum" do
    let(:next_cursor_number) {PostgreSQLCursor.class_variable_get(:@@cursor_seq) + 1}
    let(:cursor_name) {"cursor_#{next_cursor_number}"}
    let(:streamer) { DatasetStreamer.new(dataset, user) }
    let(:init_sql) {"declare #{cursor_name} cursor for #{dataset.all_rows_sql}"}
    let(:row_data) do
      [
          {'col1' => 'row1val1', 'col2' => 'row1val2'},
          {'col1' => 'row2val1', 'col2' => 'row2val2'}
      ]
    end
    before do

      fetch_sql = "fetch 1000 from #{cursor_name}"
      stub_gpdb(account,
                 init_sql => [],
                 fetch_sql => row_data
      )
    end

    it "returns an enumerator that yields the header and rows from the dataset in csv" do
      enumerator = streamer.enum
      enumerator.next.should == "col1,col2\nrow1val1,row1val2\n"
      enumerator.next.should == "row2val1,row2val2\n"
      #test that it fetches again
      enumerator.next.should == "row1val1,row1val2\n"
    end

    context "with quotes in the data" do
      let(:row_data) do
        [
            {'col1' => 'with"double"quotes', 'col2' => "with'single'quotes", 'col3' => "with,comma"}
        ]
      end

      it "escapes quotes in the csv" do
        enumerator = streamer.enum
        enumerator.next #header row and first row
        enumerator.next.should == %Q{"with""double""quotes",with'single'quotes,"with,comma"\n}
      end
    end

    context "with row_limit" do
      let(:init_sql) {"declare #{cursor_name} cursor for #{dataset.all_rows_sql(42)}"}

      it "uses the limit for the query" do
        streamer.row_limit = 42
        enumerator = streamer.enum.next
      end
    end
  end
end
