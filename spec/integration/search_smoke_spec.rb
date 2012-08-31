require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Search" do
  before :all do
    stub(GpdbColumn).columns_for.with_any_args {
      []
    }
    Sunspot.searchable.each do |model|
      model.solr_index(:batch_commit => false)
    end
    Sunspot.commit
  end

  before do
    login(users(:bob))
  end

  describe "global search" do
    it "searches all types of objects" do
      fill_in 'search_text', :with => 'bobsearch'
      find('.chorus_search_container>input').native.send_keys(:return)
      wait_for_ajax
      page.find(".dataset_list").should have_content(datasets(:bobsearch_table).name)
      found_user = users(:bob)
      page.find(".user_list").should have_content("#{found_user.first_name} #{found_user.last_name}")
    end
  end

  describe "model specific search" do
    it "searches for workspaces" do
      fill_in 'search_text', :with => 'bobsearch'
      find('.chorus_search_container>input').native.send_keys(:return)
      wait_for_ajax
      click_link 'All Results'
      click_link 'Workspaces'
      wait_for_ajax
      current_route.should == "/search/all/workspace/bobsearch"
      page.find(".workspace_list").should have_content(workspaces(:alice_public).name)
    end
  end

end