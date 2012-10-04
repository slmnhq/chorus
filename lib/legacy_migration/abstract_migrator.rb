class AbstractMigrator
  class MigratorValidationError < Exception; end

  def self.validate
    classes_to_validate.each do |klass|
      klass, finder_options = klass if klass.is_a? Array
      klass.find_each(finder_options || {}) do |record|
        record.valid? || raise(MigratorValidationError.new("Invalid record. Errors: #{record.errors.full_messages} Record: #{record.inspect}"))
      end
    end
  end

  def self.silence_activerecord
    ActiveRecord::Base.record_timestamps = false
    Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)
    yield
    Sunspot.session = Sunspot.session.original_session
    ActiveRecord::Base.record_timestamps = true
  end

  def self.silence_solr
    Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)
    yield
    Sunspot.session = Sunspot.session.original_session
  end
end