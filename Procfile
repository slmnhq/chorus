web:	rails s
worker: script/rails runner script/start_worker.rb
clock:  script/start_clock.rb
jasmine: bundle exec rake jasmine
solr_test: env RAILS_ENV=test bundle exec rake services:solr:run
solr_dev: bundle exec rake sunspot:solr:run
nginx: /usr/local/sbin/nginx