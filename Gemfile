source :rubygems

gem 'rails', '3.2.5'
gem 'bcrypt-ruby'

gem 'json'
gem 'will_paginate'
gem 'net-ldap'
gem 'paperclip'
gem 'queue_classic', :git => "git://github.com/pivotal-leopold/queue_classic.git"
gem 'clockwork'
gem 'foreman', '0.46'
gem 'allowy'
gem 'httparty', :require => false
gem 'sunspot_rails'

platform :jruby do
  gem 'jruby-openssl'
  gem 'activerecord-jdbcpostgresql-adapter', :git => "git://github.com/bdon/activerecord-jdbc-adapter.git"
end

group :assets do
  gem 'sass-rails'
  gem 'compass-rails'
  gem 'handlebars_assets'

  # gem 'coffee-rails', '~> 3.2.1'
  # # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  gem 'therubyrhino'
  gem 'uglifier', '>= 1.0.3'
end

group :test do
  gem 'rr'
  gem 'factory_girl'
  gem 'capybara'
  gem 'capybara-webkit'
  gem 'database_cleaner'
  gem 'capybara-screenshot'
  gem 'rspec-rails'
  gem 'shoulda-matchers'
  gem 'timecop'
  gem 'hashie'
  gem 'vcr'
end

group :test, :development do
  gem 'rake'
  gem 'ruby-debug'
  gem 'awesome_print'
  gem 'jasmine'
  gem 'rspec_api_documentation'
  gem 'forgery'
  gem 'sunspot_matchers'
end

group :development do
  #gem 'license_finder', :git => "https://github.com/pivotal/LicenseFinder.git"
  gem 'jetpack', :git => "git://github.com/bdon/jetpack.git", :branch => 'old'
  gem 'sunspot_solr'
end

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'
