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
  
  desc 'Deploy PACKAGE_FILE to staging'
  task :deploy_stage do
    unless ENV['PACKAGE_FILE']
      puts "You have to specify PACKAGE_FILE to deploy"
      exit(1)
    end
    deploy_configuration = YAML.load_file(Rails.root.join('config', 'deploy.yml'))['stage']
    PackageMaker.deploy(deploy_configuration, ENV['PACKAGE_FILE'])
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

    answers_file = "~/install_answers.txt"

    run "scp #{filename} #{host}:~"
    run "ssh #{host} 'echo \"#{path}\" > #{answers_file} && echo \"y\" >> #{answers_file} && echo \"#{postgres_build}\" >> #{answers_file}'"
    run "ssh #{host} 'cat /dev/null > #{path}/install.log'"
    install_success = run "ssh #{host} 'cd ~ && ./#{filename} #{answers_file}'"
    run "scp #{host}:#{path}/install.log install.log"

    run "ssh #{host} 'cd ~; rm #{filename}'"
    if install_success
      builds_to_keep = 5
      run "ssh #{host} 'test `ls #{path}/releases | wc -l` -gt #{builds_to_keep} && find #{path}/releases -maxdepth 1 -not -newer \"`ls -t | head -#{builds_to_keep + 1} | tail -1`\" -not -name \".\" -exec rm -rf {} \\;'"
    end

    raise StandardError.new("Installation failed!") unless install_success
  end

  def deploy(config, filename=nil)
    filename ||= "greenplum-chorus-#{version_name}.sh"
    upload(filename, config)
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

