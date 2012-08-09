web:	bundle exec mizuno -p 3000
worker: script/rails runner script/start_worker.rb
clock:  script/start_clock.rb
jasmine: bundle exec rake jasmine
solr_test: env RAILS_ENV=test bundle exec rake services:solr:run
solr_dev: bundle exec rake sunspot:solr:run
nginx: /usr/local/sbin/nginx
gpfdist_write: ./vendor/gpfdist -p 8000 -d /tmp
gpfdist_read: ./vendor/gpfdist -p 8001 -d /tmp
