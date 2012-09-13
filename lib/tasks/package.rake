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

  task :stage => :installer do
    deploy_configuration = YAML.load_file(Rails.root.join('config', 'deploy.yml'))['stage']
    PackageMaker.deploy(deploy_configuration)
  end

  task :cleanup do
    PackageMaker.clean_workspace
  end
end

packaging_tasks = Rake.application.top_level_tasks.select { |task| task.to_s.match(/^package:/) }

last_packaging_task = packaging_tasks.last
Rake::Task[last_packaging_task].enhance do
  Rake::Task[:'package:cleanup'].invoke
end if last_packaging_task

desc "Deploy an installer package file to a server"
task :deploy, [:server, :package_file] do |t, args|
  server = args[:server]
  package_file = args[:package_file]
  unless package_file && server
    puts "You have to specify package_file to deploy and server to deploy to"
    exit 1
  end
  deploy_configuration = YAML.load_file(Rails.root.join('config', 'deploy.yml'))[server]
  PackageMaker.deploy(deploy_configuration, package_file)
end


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
      "solr/conf/",
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
    installation_path = install_root + 'chorus_installation'

    FileUtils.rm_rf(install_root)
    FileUtils.mkdir_p(installation_path)

    PATHS_TO_PACKAGE.each do |path|
      FileUtils.mkdir_p(File.join(installation_path, File.dirname(path)))
      FileUtils.ln_s File.join(rails_root, path), File.join(installation_path, path)
    end

    FileUtils.ln_s File.join(rails_root, 'packaging/install.rb'), install_root

    system("GZIP='--fast' #{rails_root}/packaging/makeself/makeself.sh --follow --nox11 --nowait #{install_root} greenplum-chorus-#{version_name}.sh 'Chorus #{Chorus::VERSION::STRING} installer' ./chorus_installation/bin/ruby ../install.rb") || exit(1)
  end

  def upload(package_file, config)
    host = config['host']
    install_path = config['install_path']
    postgres_build = config['postgres_build']
    legacy_path = config['legacy_path']

    File.open('install_answers.txt', 'w') do |f|
      # where the existing install lives
      if legacy_path.present?
        f.puts(legacy_path)
      else
        f.puts(install_path)
      end

      # confirm the upgrade
      f.puts('y')

      # where to install 2.2
      if legacy_path.present?
        f.puts(install_path)
      end
      f.puts(postgres_build)
    end

    # remove previous chorusrails install
    if legacy_path.present?
      chorus_home = "#{install_path}/current"
      run "ssh #{host} 'test -e #{install_path} && CHORUS_HOME=#{chorus_home} #{chorus_home}/packaging/server_control.sh stop'"
      run "ssh #{host} 'rm -rf #{install_path}'"
    end

    # run upgrade script
    installer_dir = "~/chorusrails-installer"
    run "ssh #{host} 'rm -rf #{installer_dir} && mkdir -p #{installer_dir}'"
    run "scp #{package_file} install_answers.txt '#{host}:#{installer_dir}'"
    run "ssh #{host} 'cat /dev/null > #{install_path}/install.log'" unless legacy_path.present?
    install_success = run "ssh #{host} 'cd #{installer_dir} && ./#{package_file} #{installer_dir}/install_answers.txt'"
    run "scp '#{host}:#{install_path}/install.log' install.log" # copy installation log back from target
    run "ssh #{host} 'cd #{installer_dir} && rm -f #{package_file}'" # remove installer script from target

    if install_success
      builds_to_keep = 5
      run "ssh #{host} 'cd #{install_path}/releases && test `ls | wc -l` -gt 5 && find . -maxdepth 1 -not -newer \"`ls -t | head -6 | tail -1`\" -not -name \".\" -exec rm -rf {} \;'"
      run "ssh #{host} 'CHORUS_HOME=~/chorusrails/current ~/chorusrails/server_control.sh start'"
    end

    raise StandardError.new("Installation failed!") unless install_success
  end

  def deploy(config, package_file=nil)
    package_file ||= "greenplum-chorus-#{version_name}.sh"
    upload(package_file, config)
  end

  def clean_workspace
    run "rm -r .bundle"
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
    puts %x{#{cmd}}
    $? == 0
  end

  def relative(path)
    current = Pathname.new(Dir.pwd)
    Pathname.new(path).relative_path_from(current).to_s
  end

  def version_name
    "#{Chorus::VERSION::STRING}-#{head_sha}"
  end
end

