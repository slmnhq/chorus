module Gnip
  class InstanceRegistrar

    def self.create!(instance_attributes, owner)
      chorus_gnip = ChorusGnip.new({:url => instance_attributes[:host],
                                    :username => instance_attributes[:username],
                                    :password => instance_attributes[:password]
                                   })
      if chorus_gnip.auth
        instance = GnipInstance.new(instance_attributes)
        instance.owner = owner
        instance.save!
        Events::GnipInstanceCreated.by(owner).add(:gnip_instance => instance)
        instance
      else
        raise ApiValidationError.new(:connection, :generic, {:message => "Url, username and password combination is Invalid"})
      end
    end
  end
end