source :rubygems

gem 'rails', '3.2.5'

gem 'will_paginate'
gem 'net-ldap',      :require => false
gem 'paperclip', '3.0.4'
gem 'queue_classic', :github => "pivotal-leopold/queue_classic"
gem 'clockwork',     :require => false
gem 'allowy'
gem 'sunspot_rails', '2.0.0.pre.120417'
gem 'jetpack', :github => "pivotal-leopold/jetpack", :require => false
gem 'sunspot_solr', '2.0.0.pre.120417'
gem 'quiet_assets'
gem 'nokogiri'
gem 'postgresql_cursor'

platform :jruby do
  gem 'jruby-openssl', :require => false
  # Pull request: https://github.com/jruby/activerecord-jdbc-adapter/pull/207
  gem 'activerecord-jdbcpostgresql-adapter', :github => "pivotal-leopold/activerecord-jdbc-adapter", :branch => "dynamic-schema-search-path"
end

group :assets do
  gem 'sass-rails'
  gem 'compass-rails'
  gem 'handlebars_assets'
  gem 'therubyrhino'
  gem 'uglifier', '>= 1.0.3'
end

group :integration do
  gem 'capybara',            :require => false
  gem 'capybara-webkit'
  gem 'headless'
  gem 'database_cleaner',    :require => false
  gem 'capybara-screenshot'
end

group :test, :integration do
  gem 'rr'
  gem 'factory_girl'
  gem 'shoulda-matchers',    :require => false
  gem 'rspec-rails'
  gem 'timecop'
  gem 'hashie'
  gem 'vcr'
  gem 'fakefs',              :require => false
  gem 'chunky_png'
end

group :test, :development, :integration do
  gem 'foreman', '0.46',         :require => false
  gem 'rake',                    :require => false
  gem 'ruby-debug',              :require => false
  gem 'jasmine'
  gem 'rspec_api_documentation'
  gem 'forgery'
  gem 'sunspot_matchers', :github => "pivotal/sunspot_matchers", :branch => "sunspot_2_pre"
  gem 'fixture_builder'
end

group :development do
  #gem 'license_finder', :git => "https://github.com/pivotal/LicenseFinder.git"
  gem 'thin'
end
