namespace :db do
  namespace :integration do
    # desc "Recreate the integration database from an existent structure.sql file"
    task :load_structure => 'db:integration:purge' do
      begin
        old_env, ENV['RAILS_ENV'] = ENV['RAILS_ENV'], 'integration'
        Rake::Task[:"db:structure:load"].invoke
      ensure
        ENV['RAILS_ENV'] = old_env
      end
    end

    # desc "Empty the test database"
    task :purge => :environment do
      abcs = ActiveRecord::Base.configurations
      case abcs['integration']['adapter']
        when /mysql/
          ActiveRecord::Base.establish_connection(:test)
          ActiveRecord::Base.connection.recreate_database(abcs['integration']['database'], mysql_creation_options(abcs['integration']))
        when /postgresql/
          ActiveRecord::Base.clear_active_connections!
          drop_database(abcs['integration'])
          create_database(abcs['integration'])
        when /sqlite/
          dbfile = abcs['integration']['database']
          File.delete(dbfile) if File.exist?(dbfile)
        when 'sqlserver'
          integration = abcs.deep_dup['integration']
          integration_database = integration['database']
          integration['database'] = 'master'
          ActiveRecord::Base.establish_connection(integration)
          ActiveRecord::Base.connection.recreate_database!(integration_database)
        when "oci", "oracle"
          ActiveRecord::Base.establish_connection(:integration)
          ActiveRecord::Base.connection.structure_drop.split(";\n\n").each do |ddl|
            ActiveRecord::Base.connection.execute(ddl)
          end
        when 'firebird'
          ActiveRecord::Base.establish_connection(:integration)
          ActiveRecord::Base.connection.recreate_database!
        else
          raise "Task not supported by '#{abcs['integration']['adapter']}'"
      end
    end

  end

  namespace :test do
    task :prepare => 'db:integration:load_structure'
  end
end