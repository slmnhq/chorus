require 'spec_helper'

describe TypeAheadSearchPresenter, :type => :view do

  let(:user) { users(:owner) }

  before do
    reindex_solr_fixtures
    stub(ActiveRecord::Base).current_user { user }
  end

  describe "#to_hash" do

    let(:search) do
      TypeAheadSearch.new(user,
                          :query => 'typeahead').tap do |search|
        record_with_vcr do
          search.search
        end
      end
    end

    let(:presenter) { Presenter.present(search, view) }
    it "returns an array of models including one of each type" do
      results = presenter.to_hash[:type_ahead][:results]
      types = results.map { |result| result[:entity_type] }
      types.should include("user", "workfile", "dataset", "hdfs_file", "greenplum_instance", "hadoop_instance", "workspace")
    end
  end
end
