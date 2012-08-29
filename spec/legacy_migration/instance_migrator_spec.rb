require 'legacy_migration_spec_helper'

describe InstanceMigrator do
  describe ".migrate" do
    before do
      InstanceMigrator.migrate
    end

    describe "copying the data" do
      it "creates new gpdb instances for legacy gpdb instances and is idempotent" do
        count = Legacy.connection.select_all("SELECT count(*) FROM edc_instance WHERE instance_provider = 'Greenplum Database'").first["count"]
        GpdbInstance.count.should == count
        InstanceMigrator.migrate
        GpdbInstance.count.should == count
      end

      it "copies the correct data fields from the legacy instance" do
        Legacy.connection.select_all("SELECT * FROM edc_instance WHERE instance_provider = 'Greenplum Database'").each do |legacy_instance|
          gpdb_instance = GpdbInstance.find_by_legacy_id(legacy_instance["id"])

          gpdb_instance.name.should == legacy_instance["name"]
          gpdb_instance.description.should == legacy_instance["description"]
          gpdb_instance.host.should == legacy_instance["host"]
          gpdb_instance.port.should == legacy_instance["port"].try(:to_i)
          #gpdb_instance.expire.should == legacy_instance["expire"]
          #gpdb_instance.state.should == legacy_instance["state"]
          gpdb_instance.provision_type.should == legacy_instance["provision_type"]
          #gpdb_instance.provision_id.should == legacy_instance["provision_id"]
          #gpdb_instance.size.should == legacy_instance["size"]
          gpdb_instance.instance_provider.should == legacy_instance["instance_provider"]
          #gpdb_instance.last_check.should == legacy_instance["last_check"]
          #gpdb_instance.provision_name.should == legacy_instance["provision_name"]
          #gpdb_instance.is_deleted.should == (legacy_instance["is_deleted"] != "f")
          #gpdb_instance.instance_version.should == legacy_instance["instance_version"]
          gpdb_instance.maintenance_db.should == legacy_instance["maintenance_db"]
          #gpdb_instance.connection_string.should == legacy_instance["connection_string"]

          gpdb_instance.owner.should == User.find_by_username(legacy_instance["owner"])
        end
      end
    end
  end
end
