#This is because ips_from removes the x-forwarded-for when the request comes from a "private" network, including 10.x.x.x addresses.
module ActionDispatch
  class RemoteIp
    class GetIp
      def ips_from(header, allow_proxies = false)
        @env[header] ? @env[header].strip.split(/[,\s]+/) : []
      end
    end
  end
end