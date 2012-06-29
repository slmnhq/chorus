#!/bin/bash
rake db:drop db:create db:migrate
rake sunspot:solr:run&
sleep 20
rake db:seed db:test:prepare db:test:prepare:legacy 
ps aux | grep -- 'solr' | grep -v grep | awk '{print $2}' | xargs kill