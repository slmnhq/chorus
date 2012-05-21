#!/bin/sh
ps aux | grep 'script\/rails s' | grep -v grep | awk '{print $2}' | xargs kill -9
