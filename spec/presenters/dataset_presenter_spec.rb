require 'spec_helper'

describe DatasetPresenter, :type => :view do
  it_behaves_like "database object presenter", :gpdb_table
end