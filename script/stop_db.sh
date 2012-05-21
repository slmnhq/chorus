#!/bin/sh
ps aux | grep -- '-p8543' | grep -v grep | awk '{print $2}' | xargs kill -9
