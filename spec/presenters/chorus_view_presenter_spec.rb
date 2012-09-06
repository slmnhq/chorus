require 'spec_helper'

describe ChorusViewPresenter, :type => :view do
  before do
    @user = FactoryGirl.create :user
    stub(ActiveRecord::Base).current_user { @user }
  end

  let(:chorus_view) { datasets(:bob_chorus_view) }
  let(:presenter) { described_class.new(chorus_view, view) }
  let(:hash) { presenter.to_hash }

  it "hash should have attributes" do
    hash[:id].should_not be_nil
    hash[:object_name].should == "bob_chorus_view"
    hash[:type].should == "CHORUS_VIEW"
    hash[:object_type].should == "CHORUS_VIEW"
    hash[:query].should == "select * from a_table"

    schema = hash[:schema]
    schema[:id].should == chorus_view.schema.id
    schema[:name].should == chorus_view.schema.name
  end

  it_behaves_like "sanitized presenter", :chorus_view, :name, :object_name
end
