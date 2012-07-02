source :rubygems

gem 'rails', '3.2.5'

gem 'will_paginate', :require => false
gem 'net-ldap',      :require => false
gem 'paperclip'
gem 'queue_classic', :git => "git://github.com/pivotal-leopold/queue_classic.git", :require => false
gem 'clockwork',     :require => false
gem 'allowy',        :require => false
gem 'sunspot_rails', '2.0.0.pre.120417'

platform :jruby do
  gem 'jruby-openssl', :require => false
  gem 'activerecord-jdbcpostgresql-adapter', :git => "git://github.com/bdon/activerecord-jdbc-adapter.git"
end

group :assets do
  gem 'sass-rails'
  gem 'compass-rails'
  gem 'handlebars_assets'
  gem 'therubyrhino'
  gem 'uglifier', '>= 1.0.3'
end

group :test do
  gem 'rr'
  gem 'factory_girl'
  gem 'capybara',            :require => false
  gem 'capybara-webkit',     :require => false
  gem 'database_cleaner',    :require => false
  gem 'capybara-screenshot', :require => false
  gem 'shoulda-matchers',    :require => false
  gem 'rspec-rails'
  gem 'timecop',             :require => false
  gem 'hashie'
  gem 'vcr'
end

group :test, :development do
  gem 'foreman', '0.46',         :require => false
  gem 'rake',                    :require => false
  gem 'ruby-debug',              :require => false
  gem 'jasmine',                 :require => false
  gem 'rspec_api_documentation'
  gem 'forgery',                 :require => false
  gem 'sunspot_matchers', :git => "git://github.com/pivotal/sunspot_matchers.git", :branch => "sunspot_2_pre"
end

group :development do
  #gem 'license_finder', :git => "https://github.com/pivotal/LicenseFinder.git"
  gem 'jetpack', :git => "git://github.com/bdon/jetpack.git", :branch => 'old', :require => false
  gem 'sunspot_solr', '2.0.0.pre.120417'
end
