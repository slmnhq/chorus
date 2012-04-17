Chorus::Application.configure do |config|
  config.config.collection_defaults = {
      :page => 1,
      :per_page => 50,
      :order => "first_name"
  }

  config.config.sorting_order_white_list = ["first_name", "last_name"]
end