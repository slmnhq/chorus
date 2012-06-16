require 'spec_helper'

describe DatasetPresenter, :type => :view do
  it_behaves_like "dataset presenter", :gpdb_table
end