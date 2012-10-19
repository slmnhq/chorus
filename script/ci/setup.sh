export JRUBY_OPTS="--1.9 --client -J-Xmx512m -J-Xms512m -J-Xmn128m"
export PATH="$HOME/phantomjs/bin:/opt/postgres/9.1/bin:$HOME/.rbenv/bin:$PATH"

eval "$(rbenv init - --no-rehash)"
rbenv shell `cat .rbenv-version`
export JASMINE_PORT=8888

gem list bundler | grep bundler || gem install bundler
bundle install --binstubs=b/ || (echo "bundler failed!!!!!!!!" && exit 1)

mkdir -p tmp/pids
rm tmp/fixture_builder*.yml

cp config/chorus.yml.example config/chorus.yml

b/rake db:drop db:create db:migrate --trace > "$WORKSPACE/bundle.log"
