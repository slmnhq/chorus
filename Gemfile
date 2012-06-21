source :rubygems

gem 'rails', '3.2.5'
gem 'bcrypt-ruby'

gem 'json'
gem 'will_paginate'
gem 'net-ldap'
gem 'paperclip'
gem 'queue_classic', "2.0.0rc14"
gem 'clockwork'
gem 'foreman'
gem 'allowy'
gem 'httparty', :require => false
gem 'wasabi', :git => "https://github.com/bdon/wasabi.git"
gem 'savon'

platform :mri do
  gem 'thin'
  gem 'pg'
end

platform :jruby do
  gem 'ruby-debug'
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
  gem 'database_cleaner'
  gem 'capybara-screenshot'
  gem 'rspec-rails'
  gem 'shoulda-matchers'
  gem 'timecop'
  gem 'hashie'
  gem 'vcr'
end

group :test, :development do
  gem 'awesome_print'
  gem 'jasmine'
  gem 'rspec_api_documentation'
  gem 'forgery'
end

group :development do
  #gem 'license_finder', :git => "https://github.com/pivotal/LicenseFinder.git"
end

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'
