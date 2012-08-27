require_relative '../../version'

namespace :package do
  task :check_clean_working_tree do
    unless ENV['IGNORE_DIRTY'] || system('git diff-files --quiet')
      puts "You have a dirty working tree. You must stash or commit your changes before packaging. Or run with IGNORE_DIRTY=true"
      exit(1)
    end
  end

  task :prepare_app => :check_clean_working_tree do
    Rake::Task[:'api_docs:package'].invoke
    system "rake assets:precompile RAILS_ENV=production RAILS_GROUPS=assets --trace"
    system "bundle exec jetpack ."
    PackageMaker.write_version
  end

  desc 'Generate binary installer'
  task :installer => :prepare_app do
    PackageMaker.make_installer
  end

  task :stage => :prepare_app do
    deploy_configuration = YAML.load_file(Rails.root.join('config', 'deploy.yml'))['stage']
    PackageMaker.deploy(deploy_configuration)
  end

  task :prepare_remote do
    deploy_configuration = YAML.load_file(Rails.root.join('config', 'deploy.yml'))['stage']
    PackageMaker.prepare_remote(deploy_configuration)
  end

  task :cleanup do
    PackageMaker.clean_workspace
  end
end

desc 'Generate new package'
task :package => 'package:prepare_app' do
  PackageMaker.make
end

packaging_tasks = Rake.application.top_level_tasks.select { |task| task.to_s.match(/^package:/) }

last_packaging_task = packaging_tasks.last
Rake::Task[last_packaging_task].enhance do
  Rake::Task[:'package:cleanup'].invoke
end if last_packaging_task


module PackageMaker
  PATHS_TO_PACKAGE = [
      "bin/",
      "app/",
      "config/",
      "db/",
      "doc/",
      "lib/",
      "packaging/",
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
      ".bundle/",
  ]

  extend self

  def make_installer
    rails_root = File.expand_path(File.dirname(__FILE__) + '/../../')
    install_root = rails_root + '/tmp/installer/'
    installer_path = install_root + 'chorus_installation'

    FileUtils.rm_rf(install_root)
    FileUtils.mkdir_p(installer_path)

    PATHS_TO_PACKAGE.each do |path|
      FileUtils.ln_s File.join(rails_root, path), File.join(installer_path, path)
    end

    FileUtils.ln_s File.join(rails_root, 'packaging/install.rb'), install_root

    system("#{rails_root}/packaging/makeself/makeself.sh --follow --nox11 --nowait #{install_root} greenplum-chorus-#{version_name}.sh 'Chorus #{Chorus::VERSION::STRING} installer' ./chorus_installation/bin/ruby ../install.rb") || exit(1)
  end

  def upload(filename, config)
    host = config['host']
    path = config['path']
    postgres_build = config['postgres_build']

    release_name = version_name

    shared_path = path + "/shared"
    current_path = path + "/current"
    releases_path = path + "/releases"
    release_path = path + "/releases/" + release_name

    run "ssh #{host} 'mkdir -p #{path}'"
    run "ssh #{host} 'mkdir -p #{release_path}'"
    run "scp #{filename} #{host}:#{path}"
    run "ssh #{host} 'mkdir -p #{release_path} && cd #{release_path}; tar --overwrite -xvf #{path}/#{filename} &> /dev/null'"

    run "ssh #{host} 'mkdir -p #{shared_path}/solr/data'"
    run "ssh #{host} 'mkdir -p #{release_path}/solr && ln -s #{shared_path}/solr/data #{release_path}/solr/'"

    run "ssh #{host} 'cd #{release_path} && mkdir -p #{shared_path}/log && ln -s #{shared_path}/log #{release_path}/'"
    run "ssh #{host} 'cd #{release_path} && mkdir -p #{shared_path}/tmp && ln -s #{shared_path}/tmp #{release_path}/'"
    run "ssh #{host} 'cd #{release_path} && mkdir -p #{shared_path}/system && ln -s #{shared_path}/system #{release_path}/'"
    run "ssh #{host} 'cd #{release_path} && ln -s #{path}/postgres #{release_path}/postgres'"
    run "ssh #{host} 'cd #{release_path} && ln -s #{shared_path}/db #{release_path}/postgres-db'"

    # symlink configuration
    run "ssh #{host} 'cd #{release_path} && ln -s #{shared_path}/database.yml #{release_path}/config'"
    run "ssh #{host} 'cd #{release_path} && ln -s #{shared_path}/chorus.yml #{release_path}/config'"


    # Setup DB
    run "ssh #{host} 'cd #{path}; rm -rf ./postgres'"
    run "ssh #{host} 'cd #{path}; tar -xvf #{release_path}/packaging/postgres/#{postgres_build}  &> /dev/null'"

    run "ssh #{host} 'test ! -e #{shared_path}/db && RELEASE_PATH=#{release_path} CHORUS_HOME=#{path} bash #{release_path}/packaging/bootstrap_app.sh'"

    # Temporary
    #
    #run "ssh #{host} 'cd #{path}; ./postgres/bin/createuser -p 9543 -s edcadmin"
    run "ssh #{host} 'PATH=$PATH:#{path}/postgres/bin RAILS_ENV=production #{release_path}/bin/rake db:migrate'"

    run "ssh #{host} 'cd #{current_path}; CHORUS_HOME=#{current_path} RAILS_ENV=production ./packaging/server_control.sh stop'"
    run "ssh #{host} 'cd #{path} && ln -sfT #{release_path} #{current_path}'"
    run "ssh #{host} 'cd #{current_path}; CHORUS_HOME=#{current_path} RAILS_ENV=production ./packaging/server_control.sh start'"

    run "ssh #{host} 'cd #{path}; rm greenplum*.tar.gz'"
    #run "ssh #{host} 'cd #{releases_path}; ls | grep -v #{head_sha} | xargs rm -r'"
  end

  def deploy(config)
    check_existing_version(config)

    filename = make
    upload(filename, config)
  end

  def make(options = {})
    filename = "greenplum-chorus-#{timestamp}-#{version_name}.tar.gz"
    archive_app(filename)

    filename
  end

  def clean_workspace
    run "rm -r .bundle"
  end

  def prepare_remote(config)
    path = config['path']
    host = config['host']
    shared_path = config['path'] + '/shared'

    run "ssh #{host} 'mkdir -p #{path}/releases'"
    run "ssh #{host} 'mkdir -p #{shared_path}/tmp/pids && mkdir -p #{shared_path}/log && mkdir -p #{shared_path}/system && mkdir -p #{shared_path}/solr/data'"
  end

  def check_existing_version(config)
    return if ENV['FORCE_DEPLOY']
    versions = `ssh #{config['host']} 'ls #{config['path']}/releases/'`.split

    if versions.include? version_name
      puts "There is a version #{version_name} in the server. Do you want to overwrite it? Press Enter to continue or Ctrl-C to cancel. Or run with FORCE_DEPLOY=true"
      puts "Press enter to continue..." while STDIN.gets != "\n"
    end
  end

  def archive_app(filename)
    run "tar czf #{filename} --exclude='public/system/' --exclude='javadoc' --exclude='.git' --exclude='log' --exclude 'config/database.yml' --exclude 'config/chorus.yml' #{PATHS_TO_PACKAGE.join(" ")}"
  end

  def timestamp
    Time.now.strftime("%Y%m%d-%H%M%S")
  end

  def head_sha
    `git rev-parse HEAD`.strip[0..8]
  end

  def write_version
    File.open('version_build', 'w') do |f|
      f.puts version_name
    end
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
end
