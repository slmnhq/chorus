require_relative '../../version'

desc 'Generate new package'
task :package do
  PackageMaker.make
end

task :stage do
  deploy_configuration = YAML.load_file(Rails.root.join('config', 'deploy.yml'))['stage']
  PackageMaker.deploy(deploy_configuration)
end

task :prepare_remote do
  deploy_configuration = YAML.load_file(Rails.root.join('config', 'deploy.yml'))['stage']
  PackageMaker.prepare_remote(deploy_configuration)
end


module PackageMaker
  extend self

  def upload(filename, config)
    host = config['host']
    path = config['path']

    release_name = version_name

    current_path = path + "/current"
    releases_path = path + "/releases"
    release_path = path + "/releases/" + release_name

    run "scp #{filename} #{host}:#{path}"
    run "ssh #{host} 'mkdir -p #{release_path} && cd #{release_path}; tar --overwrite -xvf #{path}/#{filename}'"

    run "ssh #{host} 'mkdir -p #{release_path}/solr && ln -s #{path}/shared/solr/data #{release_path}/solr/'"

    run "ssh #{host} 'cd #{release_path} && ln -s #{path}/shared/log #{release_path}/'"
    run "ssh #{host} 'cd #{release_path} && ln -s #{path}/shared/tmp #{release_path}/'"
    run "ssh #{host} 'cd #{release_path} && ln -s #{path}/shared/system #{release_path}/'"

    # symlink configuration
    run "ssh #{host} 'cd #{release_path} && ln -s #{path}/shared/database.yml #{release_path}/config'"
    run "ssh #{host} 'cd #{release_path} && ln -s #{path}/shared/chorus.yml #{release_path}/config'"

    run "ssh #{host} 'cd #{release_path}; RAILS_ENV=production bin/rake db:migrate'"

    run "ssh chorus-staging 'cd #{current_path}; RAILS_ENV=production script/server_control.sh stop'"
    run "ssh #{host} 'cd #{path} && rm -f #{current_path} && ln -s #{release_path} #{current_path}'"
    run "ssh chorus-staging 'cd #{current_path}; RAILS_ENV=production script/server_control.sh start'"

    run "ssh chorus-staging 'cd #{path}; rm greenplum*.tar.gz"
    run "ssh chorus-staging 'cd #{releases_path}; ls | grep -v #{head_sha} | xargs rm -r'"
  end

  def deploy(config)
    write_jetpack_yaml(config)
    check_existing_version(config)

    filename = make
    upload(filename, config)
  end

  def make(options = {})
    prepare_workspace
    current_sha = head_sha
    filename = "greenplum-chorus-#{timestamp}-#{version_name}.tar.gz"
    archive_app(filename, current_sha)

    clean_workspace
    filename
  end

  def prepare_workspace
    run "rm -rf vendor/bundler_gem"
  end

  def clean_workspace
    run "rm -r .bundle"
  end

  def prepare_remote(config)
    path = config['path']
    host = config['host']

    run "ssh #{host} 'mkdir -p #{path}/releases'"
    run "ssh #{host} 'mkdir -p #{path}/shared/tmp && mkdir -p #{path}/shared/log && mkdir -p #{path}/shared/system && mkdir -p #{path}/shared/solr/data'"
  end

  def check_existing_version(config)
    return if ENV['FORCE_DEPLOY']
    versions = `ssh #{config['host']} 'ls #{config['path']}/releases/'`.split

    if versions.include? version_name
      puts "There is a version #{version_name} in the server. Do you want to overwrite it? Press Enter to continue or Ctrl-C to cancel. Or run with FORCE_DEPLOY=true"
      puts "Press enter to continue..." while STDIN.gets != "\n"
    end
  end

  def check_clean_working_tree
    unless system('git diff-files --quiet')
      puts "You have a dirty working tree. You must stash or commit your changes before packaging. Or run with IGNORE_DIRTY=true"
      exit
    end
  end

  def archive_app(filename, sha)
    unless ENV['IGNORE_DIRTY']
      check_clean_working_tree
    end
    # TODO: Why?? pwd
    run "pwd; RAILS_ENV=development bundle exec rake assets:precompile"
    run "bundle exec jetpack ."
    File.open('version_build', 'w') do |f|
      f.puts sha
    end

    files_to_tar = [
      "bin/",
      "app/",
      "config/",
      "db/",
      "doc/",
      "lib/",
      "public/",
      "script/",
      "vendor/",
      "WEB-INF/",
      "Gemfile",
      "Gemfile.lock",
      "README.md",
      "Rakefile",
      "config.ru",
      "version.rb",
      "version_build",
      ".bundle/config"
    ]

    run "tar czf #{filename} --exclude='public/system/' --exclude='javadoc' --exclude='.git' --exclude='log' --exclude 'config/database.yml' --exclude 'config/chorus.yml' #{files_to_tar.join(" ")}"
  end

  def timestamp
    Time.now.strftime("%Y%m%d-%H%M%S")
  end

  def head_sha
    `git rev-parse HEAD`.strip[0..8]
  end

  def run(cmd)
    puts cmd
    system cmd
  end

  def relative(path)
    current = Pathname.new(Dir.pwd)
    Pathname.new(path).relative_path_from(current).to_s
  end

  def version_name
    "#{Chorus::VERSION::STRING}-#{head_sha}"
  end

  def write_jetpack_yaml(config)
    defaults = YAML.load_file(Rails.root.join('config', 'jetpack.yml.defaults'))
    defaults['app_root'] = config['path'] + '/current'

    File.open(Rails.root.join('config', 'jetpack.yml'), 'w') do |file|
      YAML.dump(defaults, file)
    end
  end
end
