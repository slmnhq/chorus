#!/bin/bash

rake db:drop db:create db:migrate db:seed db:test:prepare db:test:prepare:legacy
