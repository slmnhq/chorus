require 'spec_helper'

SEARCH_LDAP_TESTGUY = <<ENTRY
dn: sAMAccountName=testguy,DC=greenplum,DC=com
altsecurityidentities: Kerberos:untitled_1@BARTOL
apple-company: Example Corporation
apple-generateduid: 927107A3-92B4-4285-B153-A5C823369E24
apple-mcxflags:: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NU
 WVBFIHBsaXN0IFBVQkxJQyAiLS8vQXBwbGUvL0RURCBQTElTVCAxLjAvL0VO
 IiAiaHR0cDovL3d3dy5hcHBsZS5jb20vRFREcy9Qcm9wZXJ0eUxpc3QtMS4w
 LmR0ZCI+CjxwbGlzdCB2ZXJzaW9uPSIxLjAiPgo8ZGljdD4KCTxrZXk+c2lt
 dWx0YW5lb3VzX2xvZ2luX2VuYWJsZWQ8L2tleT4KCTx0cnVlLz4KPC9kaWN0
 Pgo8L3BsaXN0Pgo=
authauthority: ;ApplePasswordServer;0xa1a21c2c8d9411e1940d045453061d87,1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53
authauthority: ;Kerberosv5;0xa1a21c2c8d9411e1940d045453061d87;testguy@BARTOL;BARTOL;1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53
cn: Test Guy
department: Greenery
gidnumber: 21
givenName: Test
homedirectory: 100
loginshell: /bin/bash
userprincipalname: testguy@example.com
objectclass: person
objectclass: inetOrgPerson
objectclass: organizationalPerson
objectclass: posixAccount
objectclass: shadowAccount
objectclass: top
objectclass: extensibleObject
objectclass: apple-user
sn: Guy
title: Big Kahuna
sAMAccountName: testguy
uidnumber: 1026
userpassword:: e0NSWVBUfSo=
ENTRY

SEARCH_LDAP_OTHERGUY = <<ENTRY
dn: sAMAccountName=testguy,DC=greenplum,DC=com
altsecurityidentities: Kerberos:untitled_1@BARTOL
apple-company: Example Corporation
apple-generateduid: 927107A3-92B4-4285-B153-A5C823369E24
apple-mcxflags:: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NU
 WVBFIHBsaXN0IFBVQkxJQyAiLS8vQXBwbGUvL0RURCBQTElTVCAxLjAvL0VO
 IiAiaHR0cDovL3d3dy5hcHBsZS5jb20vRFREcy9Qcm9wZXJ0eUxpc3QtMS4w
 LmR0ZCI+CjxwbGlzdCB2ZXJzaW9uPSIxLjAiPgo8ZGljdD4KCTxrZXk+c2lt
 dWx0YW5lb3VzX2xvZ2luX2VuYWJsZWQ8L2tleT4KCTx0cnVlLz4KPC9kaWN0
 Pgo8L3BsaXN0Pgo=
authauthority: ;ApplePasswordServer;0xa1a21c2c8d9411e1940d045453061d87,1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53
authauthority: ;Kerberosv5;0xa1a21c2c8d9411e1940d045453061d87;testguy@BARTOL;BARTOL;1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53
cn: Other Guy
department: Greenery
gidnumber: 21
givenName: Other
homedirectory: 100
loginshell: /bin/bash
userprincipalname: otherguy@example.com
objectclass: person
objectclass: inetOrgPerson
objectclass: organizationalPerson
objectclass: posixAccount
objectclass: shadowAccount
objectclass: top
objectclass: extensibleObject
objectclass: apple-user
sn: Guy
title: Big Kahuna
sAMAccountName: testguy
uidnumber: 1026
userpassword:: e0NSWVBUfSo=
ENTRY

CUSTOMIZED_LDAP_CHORUS_YML = <<YAML
session_timeout_minutes: 120
instance_poll_interval_minutes: 1
ldap:
  host: 10.32.88.212
  enable: true
  port: 389
  connect_timeout: 10000
  bind_timeout: 10000
  search:
    timeout: 20000
    size_limit: 200
  base: DC=greenplum,DC=com
  user_dn:
  password:
  dn_template: greenplum\{0}
  attribute:
    uid: sAMAccountName
    ou: department
    gn: givenName
    sn: sn
    cn: cn
    mail: userprincipalname
    title: title

YAML

DISABLED_LDAP_CHORUS_YML = <<YAML
session_timeout_minutes: 120
instance_poll_interval_minutes: 1
ldap:
  host: disabled.sf.pivotallabs.com
  enable: false 
  port: 389
  connect_timeout: 10000
  bind_timeout: 10000
  search:
    timeout: 20000
    size_limit: 200
  base: DC=bartol,DC=com
  user_dn: greenplum\\chorus
  password: secret
  dn_template: goofy\\{0}
  attribute:
    uid: uid 
    ou: department
    gn: givenName
    sn: sn
    cn: cn
    mail: mail
    title: title30573325

YAML

describe LdapClient do
  describe "enabled?" do
    context "when the enable flag is false" do
      before do
        stub(LdapClient).config { YAML.load(DISABLED_LDAP_CHORUS_YML)['ldap'] }
      end

      it "returns false" do
        LdapClient.should_not be_enabled
      end
    end

    context "when the enable flag is true" do
      before do
        stub(LdapClient).config { YAML.load(CUSTOMIZED_LDAP_CHORUS_YML)['ldap'] }
      end

      it "returns true" do
        LdapClient.should be_enabled
      end
    end
  end


  describe ".search" do
    before :each do
      any_instance_of(Net::LDAP) do |ldap|
        mock(ldap).search.with_any_args do |options|
          options[:filter].to_s.should == "(sAMAccountName=testguy)"
          entries
        end
      end
    end

    context "there are no results from the LDAP server" do
      let(:entries) { [] }

      it "should return an empty array" do
        LdapClient.search("testguy").should be_empty
      end
    end

    context "there are multiple matches" do
      let(:entries) { [Net::LDAP::Entry.from_single_ldif_string(SEARCH_LDAP_TESTGUY),
                       Net::LDAP::Entry.from_single_ldif_string(SEARCH_LDAP_OTHERGUY)] }

      before { stub(LdapClient).config { YAML.load(CUSTOMIZED_LDAP_CHORUS_YML)['ldap'] } }


      it "maps the customized fields to our standardized fields" do
        results = LdapClient.search("testguy")
        results.should be_a(Array)
        results.first.should be_a(Hash)
        results.first.should == { :first_name => "Test",
                                  :last_name => "Guy",
                                  :title => "Big Kahuna",
                                  :dept => "Greenery",
                                  :email => "testguy@example.com",
                                  :username => "testguy" }
        results.last.should be_a(Hash)
        results.last.should == { :first_name => "Other",
                                 :last_name => "Guy",
                                 :title => "Big Kahuna",
                                 :dept => "Greenery",
                                 :email => "otherguy@example.com",
                                 :username => "testguy" }
      end
    end
  end

  describe ".authenticate" do
    context "when the LDAP authentication succeeds" do
      it "returns true" do
        any_instance_of(Net::LDAP) do |ldap|
          mock(ldap).auth.with_any_args do |*args|
            args[0].should == "greenplum\\testguy"
            args[1].should == "secret"
            true
          end

          mock(ldap).bind { true }
        end

        LdapClient.authenticate("testguy", "secret").should be_true
      end
    end
  end
end
