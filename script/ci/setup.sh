export JRUBY_OPTS="--1.9 --client -J-Xmx512m -J-Xms512m -J-Xmn128m"
export PATH="$HOME/phantomjs/bin:/opt/postgres/9.1/bin:$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
export JASMINE_PORT=8888

gem list bundler | grep bundler || gem install bundler
bundle install --binstubs=b/

mkdir -p tmp/pids
