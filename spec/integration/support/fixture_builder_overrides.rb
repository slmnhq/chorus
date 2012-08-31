module FixtureBuilder
  class Configuration
    def fixtures_dir(path = '')
      File.expand_path(File.join(::Rails.root, spec_or_test_dir, 'integration', 'fixtures', path))
    end
  end
end