require 'net/ldap'

module LdapClient
  extend self

  def enabled?
    config['enable']
  end

  # used to prefill a user create form
  def search(username)
    results = client.search :filter => Net::LDAP::Filter.eq(config['attribute']['uid'], username)
    results.map do |result|
      {
        :username =>   result[config['attribute']['uid']].first,
        :dept =>       result[config['attribute']['ou']].first,
        :first_name => result[config['attribute']['gn']].first,
        :last_name =>  result[config['attribute']['sn']].first,
        :email =>      result[config['attribute']['mail']].first,
        :title =>      result[config['attribute']['title']].first
      }
    end
  end

  # used to login to Chorus as an LDAP user
  def authenticate(username, password)
    ldap = client
    ldap.auth make_dn(username), password
    ldap.bind
  end

  def config_file_path
    File.join(Rails.root, 'config', 'chorus.yml')
  end

  private

  def make_dn(username)
    config['dn_template'].gsub('{0}', username)
  end

  def client
    Net::LDAP.new :host => config['host'], :base => config['base']
  end

  def config
    @@config ||= YAML.load_file(config_file_path)['ldap']
  end
end
